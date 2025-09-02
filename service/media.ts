"use server";

import { uploadSingleFile } from "@/lib/services/cf-upload";
import { customError, customLog, customSuccess } from "@/lib/utils/log";
import { db } from "@/lib/db";
import { medias } from "@/lib/db/schema/generation";
import { eq } from "drizzle-orm";

/**
 * 生成随机ID
 * @returns 随机字符串
 */
function generateRandomId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * 从URL或MIME类型获取文件扩展名
 * @param url 文件URL
 * @param mimeType MIME类型
 * @returns 文件扩展名
 */
function getFileExtension(url: string, mimeType: string): string {
  // 首先尝试从URL中提取扩展名
  const urlParts = url.split("/");
  const filename = urlParts[urlParts.length - 1].split("?")[0];
  const urlExtension = filename.split(".").pop()?.toLowerCase();

  if (urlExtension && urlExtension.length <= 4) {
    return urlExtension;
  }

  // 如果URL中没有扩展名，根据MIME类型推断
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogg",
    "video/avi": "avi",
    "video/mov": "mov",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
  };

  return mimeToExt[mimeType] || "bin";
}

/**
 * 下载需要认证的媒体资源并上传到Cloudflare R2
 * @param url 媒体文件的URL
 * @param customHeaders 自定义请求头（可选）
 * @param uploadOptions 上传选项（可选）
 * @returns Promise<string> 返回Cloudflare R2的公开访问URL
 */
export default async function ConvertMedia(
  url: string,
  customHeaders?: Record<string, string>,
  uploadOptions?: {
    path?: string; // 上传路径
    skipExisting?: boolean; // 跳过已存在的文件
    supabaseId?: string; // 用户ID
    recordId?: string; // 记录ID
    taskId?: string; // 任务ID
  }
): Promise<string> {
  customLog("media > ConvertMedia", `${JSON.stringify(uploadOptions)}`);
  try {
    // 第一步：下载受保护的媒体资源
    customLog("media > ConvertMedia", `开始下载媒体资源: ${url}`);

    const downloadHeaders: Record<string, string> = {
      ...customHeaders,
    };

    // 下载媒体文件
    const downloadResponse = await fetch(url, {
      method: "GET",
      headers: downloadHeaders,
    });

    if (!downloadResponse.ok) {
      throw new Error(
        `下载媒体文件失败: ${downloadResponse.status} ${downloadResponse.statusText}`
      );
    }

    const mediaBlob = await downloadResponse.blob();
    customLog(
      "media > ConvertMedia",
      `媒体文件下载成功，大小: ${mediaBlob.size} bytes`
    );

    // 第二步：上传到Cloudflare R2
    customLog("media > ConvertMedia", "开始上传到Cloudflare R2...");

    // 生成随机文件名
    const fileExtension = getFileExtension(url, mediaBlob.type);
    const randomFilename = `${generateRandomId()}.${fileExtension}`;

    // 创建File对象
    const file = new File([mediaBlob], randomFilename, {
      type: mediaBlob.type,
    });

    // 设置上传路径，默认为 "media"
    const uploadPath = uploadOptions?.path || "media";

    // 调用Cloudflare R2上传服务
    const uploadResult = await uploadSingleFile(
      file,
      uploadPath,
      undefined, // 不使用自定义文件名，直接使用随机生成的文件名
      uploadOptions?.skipExisting || false
    );

    customSuccess(
      "media > ConvertMedia",
      `文件上传到Cloudflare R2成功: ${uploadResult.filename}`
    );

    // 将媒体文件信息存储到数据库
    if (
      uploadOptions?.supabaseId ||
      uploadOptions?.recordId ||
      uploadOptions?.taskId
    ) {
      try {
        const mediaRecord: any = {
          supabaseId: uploadOptions?.supabaseId,
          recordId: uploadOptions?.recordId,
          taskId: uploadOptions?.taskId,
          url: uploadResult.url,
          type: mediaBlob.type,
          mediaType: mediaBlob.type.startsWith("video/")
            ? ("video" as const)
            : ("image" as const),
          uploadSource: "user" as const,
          meta: {
            originalUrl: url,
            filename: uploadResult.filename,
            size: mediaBlob.size,
            uploadPath: uploadPath,
          },
          // category 字段使用数据库默认值，不显式设置
        };

        await db.insert(medias).values(mediaRecord);

        customSuccess(
          "media > ConvertMedia",
          `媒体文件信息已存储到数据库: ${uploadResult.filename}`
        );
      } catch (dbError) {
        customError(
          "media > ConvertMedia",
          `存储媒体文件信息到数据库失败: ${dbError}`
        );
        // 不抛出错误，避免影响主流程
      }
    }

    // 返回公开访问URL
    return uploadResult.url;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "ConvertMedia处理失败";
    customError("media > ConvertMedia", `处理过程中发生错误: ${errorMsg}`);
    throw error;
  }
}

/**
 * 更新媒体文件的URL和宽高比
 * @param url 新的媒体文件URL
 * @param aspectRatio 新的宽高比（格式如：16:9, 4:3等）
 * @param mediaId 要更新的媒体文件ID（可选，如果不提供则根据URL查找）
 * @returns Promise<boolean> 返回更新是否成功
 */
export async function updateMediaAspectRatio(
  url: string,
  aspectRatio: string,
  mediaId?: string
): Promise<boolean> {
  try {
    customLog(
      "media > updateMediaAspectRatio",
      `开始更新媒体文件: ${mediaId || url}, 新宽高比: ${aspectRatio}`
    );

    // 验证宽高比格式（应该是 数字/数字 的格式）
    const aspectRatioRegex = /^\d+(\.\d+)?\/\d+(\.\d+)?$/;
    if (!aspectRatioRegex.test(aspectRatio)) {
      throw new Error(
        `无效的宽高比格式: ${aspectRatio}，应该是类似 16/9 或 4/3 的格式`
      );
    }

    // 如果没有提供mediaId，根据URL查找并更新
    const updateResult = await db
      .update(medias)
      .set({
        aspectRatio: aspectRatio,
        updatedAt: new Date(),
      })
      .where(eq(medias.url, url))
      .returning({ id: medias.id, url: medias.url });

    if (updateResult.length === 0) {
      customError(
        "media > updateMediaAspectRatio",
        `未找到要更新的媒体文件: ${mediaId || url}`
      );
      return false;
    }

    customSuccess(
      "media > updateMediaAspectRatio",
      `媒体文件宽高比更新成功: ID=${updateResult[0].id}, URL=${updateResult[0].url}, 新宽高比=${aspectRatio}`
    );

    return true;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "更新媒体文件宽高比失败";
    customError(
      "media > updateMediaAspectRatio",
      `更新过程中发生错误: ${errorMsg}`
    );
    throw error;
  }
}
