// 上传文件到cloudflare
import { z } from "zod";
import { createDb } from "@/lib/db";
import { medias } from "@/lib/db/schema/generation";
import { customError, customLog, customSuccess } from "@/lib/utils/log";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// 定义上传请求的校验schema
export const uploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "至少需要上传一个文件")
    .max(20, "单次最多只能上传20个文件"),
  names: z.array(z.string().optional()).optional(),
  path: z.string().min(1, "路径不能为空"),
  skipExisting: z.boolean().default(false),
});

// Cloudflare R2 客户端配置
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_S3_URL,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

// 支持的文件类型
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/avi",
  "video/mov",
  "video/wmv",
  "video/flv",
  "video/webm",
  "video/mkv",
];

// 文件上传结果类型定义
export interface UploadResult {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  contentType: string;
  url: string;
  uploadTime: string;
  etag: string;
}

// 批量上传结果类型定义
export interface BatchUploadResult {
  totalFiles: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  results: UploadResult[];
  errors: Array<{
    filename: string;
    error: string;
    index: number;
    skipped: boolean;
  }>;
}

/**
 * 保存文件信息到数据库
 * @param fileInfo 文件信息
 */
export async function saveFileToDatabase(
  fileInfo: UploadResult
): Promise<void> {
  try {
    // 根据文件类型判断媒体类型
    const isImage = SUPPORTED_IMAGE_TYPES.includes(fileInfo.contentType);
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(fileInfo.contentType);

    if (isImage || isVideo) {
      // 构建元数据
      const meta = {
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        uploadTime: fileInfo.uploadTime,
        etag: fileInfo.etag,
        path: fileInfo.path,
      };
      const db = createDb();

      // 保存到medias表
      await db.insert(medias).values({
        url: fileInfo.url,
        type: fileInfo.contentType,
        mediaType: isImage ? "image" : "video", // 媒体类型
        aspectRatio: isImage ? "1:1" : "16:9", // 默认宽高比，可以后续优化获取真实宽高比
        uploadSource: "admin", // 管理员上传
        category: [], // 默认空标签数组
        meta: meta, // 元数据
      });

      customSuccess(
        "cf-upload > saveFileToDatabase",
        `${isImage ? "图片" : "视频"}信息已保存到数据库: ${fileInfo.filename}`
      );
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "保存到数据库失败";
    customError(
      "cf-upload > saveFileToDatabase",
      `保存文件信息到数据库失败: ${fileInfo.filename} - ${errorMsg}`
    );
    // 不抛出错误，避免影响上传流程
  }
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * 验证文件类型
 * @param contentType 文件MIME类型
 * @returns 是否支持该文件类型
 */
export function validateFileType(contentType: string): boolean {
  return [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES].includes(
    contentType
  );
}

/**
 * 处理文件名（不生成唯一标识符）
 * @param originalName 原始文件名
 * @param customName 自定义文件名
 * @returns 处理后的文件名
 */
export function processFileName(
  originalName: string,
  customName?: string
): string {
  const extension = getFileExtension(originalName);

  if (customName) {
    // 如果提供了自定义名称，使用自定义名称
    const cleanCustomName = customName.replace(/[^a-zA-Z0-9\-_.]/g, "_");
    // 如果自定义名称已包含扩展名，直接返回；否则添加扩展名
    return cleanCustomName.includes(".")
      ? cleanCustomName
      : `${cleanCustomName}.${extension}`;
  }

  // 否则使用原文件名，只清理特殊字符
  return originalName.replace(/[^a-zA-Z0-9\-_.]/g, "_");
}

/**
 * 检查文件是否存在于R2存储中
 * @param filePath 文件路径
 * @returns 文件是否存在
 */
export async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: filePath,
    });
    await r2Client.send(command);
    return true; // 文件存在
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false; // 文件不存在
    }
    // 其他错误，重新抛出
    throw error;
  }
}

/**
 * 单个文件上传核心逻辑
 * @param file 要上传的文件
 * @param customPath 上传路径
 * @param customFilename 自定义文件名
 * @param skipExisting 是否跳过已存在的文件
 * @returns 上传结果
 */
export async function uploadSingleFile(
  file: File,
  customPath: string,
  customFilename?: string,
  skipExisting: boolean = false
): Promise<UploadResult> {
  // 验证文件大小 (限制为 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    throw new Error(`文件 '${file.name}' 大小超过100MB限制`);
  }

  // 验证文件类型
  if (!validateFileType(file.type)) {
    throw new Error(
      `文件 '${file.name}' 类型不支持。支持的格式: ${[
        ...SUPPORTED_IMAGE_TYPES,
        ...SUPPORTED_VIDEO_TYPES,
      ].join(", ")}`
    );
  }

  // 处理文件名和完整路径
  const fileName = processFileName(file.name, customFilename);
  const fullPath = `${customPath.replace(/^\/+|\/+$/g, "")}/${fileName}`;

  // 检查文件是否已存在
  const fileExists = await checkFileExists(fullPath);
  if (fileExists) {
    if (skipExisting) {
      // 如果设置了跳过已存在的文件，则抛出特殊错误
      throw new Error(`SKIP_EXISTING:文件 '${fileName}' 已存在，已跳过`);
    } else {
      throw new Error(`文件 '${fileName}' 已存在，请使用不同的文件名或路径`);
    }
  }

  // 将文件转换为 Uint8Array (兼容Edge Runtime)
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  // 准备上传参数
  const uploadParams = {
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: fullPath,
    Body: fileBuffer,
    ContentType: file.type,
    ContentLength: file.size,
    Metadata: {
      // 对文件名进行URL编码以避免特殊字符问题
      "original-name": encodeURIComponent(file.name),
      "upload-time": new Date().toISOString(),
      "file-size": file.size.toString(),
    },
  };

  // 上传到 Cloudflare R2
  const command = new PutObjectCommand(uploadParams);
  const response = await r2Client.send(command);

  const publicUrl = `https://pub-d971bff5576c4337bba795092aa63092.r2.dev/${fullPath}`;

  return {
    filename: fileName,
    originalName: file.name,
    path: fullPath,
    size: file.size,
    contentType: file.type,
    url: publicUrl,
    uploadTime: new Date().toISOString(),
    etag: response.ETag || "",
  };
}

/**
 * 批量上传多个文件到Cloudflare R2
 * @param files 要上传的文件数组
 * @param customPath 上传路径
 * @param customFilenames 自定义文件名数组
 * @param skipExisting 是否跳过已存在的文件
 * @returns 批量上传结果
 */
export async function uploadMultipleFiles(
  files: File[],
  customPath: string,
  customFilenames?: (string | undefined)[],
  skipExisting: boolean = false
): Promise<BatchUploadResult> {
  customLog(
    "cf-upload > uploadMultipleFiles",
    `开始并行上传 ${files.length} 个文件到路径: ${customPath}`
  );

  // 存储上传结果
  const uploadResults: UploadResult[] = [];
  const uploadErrors: Array<{
    filename: string;
    error: string;
    index: number;
    skipped: boolean;
  }> = [];

  // 使用Promise.all并行上传所有文件
  const uploadPromises = files.map(async (file, i) => {
    const customFilename = customFilenames?.[i];

    try {
      customLog(
        "cf-upload > uploadMultipleFiles",
        `正在上传文件 ${i + 1}/${files.length}: ${file.name}`
      );

      // 调用单个文件上传逻辑
      const result = await uploadSingleFile(
        file,
        customPath,
        customFilename,
        skipExisting
      );

      customSuccess(
        "cf-upload > uploadMultipleFiles",
        `文件上传成功 ${i + 1}/${files.length}: ${result.path}`
      );

      return { success: true, result, index: i };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "上传失败";

      // 特殊处理跳过已存在文件的情况
      if (errorMsg.startsWith("SKIP_EXISTING:")) {
        const skipMsg = errorMsg.replace("SKIP_EXISTING:", "");
        customLog(
          "cf-upload > uploadMultipleFiles",
          `文件 ${i + 1}/${files.length} 已跳过: ${skipMsg}`
        );
        return {
          success: false,
          error: {
            filename: file.name,
            error: skipMsg,
            index: i,
            skipped: true,
          },
        };
      } else {
        customError(
          "cf-upload > uploadMultipleFiles",
          `文件上传失败 ${i + 1}/${files.length}: ${file.name} - ${errorMsg}`
        );
        return {
          success: false,
          error: {
            filename: file.name,
            error: errorMsg,
            index: i,
            skipped: false,
          },
        };
      }
    }
  });

  // 等待所有上传完成
  const results = await Promise.all(uploadPromises);

  // 处理结果
  for (const result of results) {
    if (result.success && result.result) {
      uploadResults.push(result.result);
      // 保存文件信息到数据库
      await saveFileToDatabase(result.result);
    } else if (result.error) {
      uploadErrors.push(result.error);
    }
  }

  // 构建响应结果
  const totalFiles = files.length;
  const successCount = uploadResults.length;
  const errorCount = uploadErrors.length;
  const skippedCount = uploadErrors.filter((error) => error.skipped).length;

  customLog(
    "cf-upload > uploadMultipleFiles",
    `多文件上传完成: 成功 ${successCount}/${totalFiles}, 失败 ${errorCount}/${totalFiles}, 跳过 ${skippedCount}/${totalFiles}`
  );

  return {
    totalFiles,
    successCount,
    errorCount,
    skippedCount,
    results: uploadResults,
    errors: uploadErrors,
  };
}

/**
 * 获取上传配置信息
 * @returns 上传配置
 */
export function getUploadConfig() {
  return {
    maxFileSize: "100MB",
    maxFileCount: 20,
    supportedImageTypes: SUPPORTED_IMAGE_TYPES,
    supportedVideoTypes: SUPPORTED_VIDEO_TYPES,
    defaultPath: "uploads",
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    features: {
      skipExisting: true,
      customFilenames: true,
      customPath: true,
    },
  };
}
