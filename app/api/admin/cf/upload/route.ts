import { NextRequest, NextResponse } from "next/server";
import { customError, customLog, customSuccess } from "@/lib/utils/log";
import { Result } from "@/lib/utils/result";
import {
  uploadSchema,
  uploadMultipleFiles,
  getUploadConfig,
} from "@/lib/services/cf-upload";

/**
 * POST /api/admin/cf/multi-upload
 * 批量上传多个文件到Cloudflare R2
 *
 * 请求体参数:
 * - files: File[] - 要上传的文件数组
 * - path?: string - 上传路径 (可选，默认为 'uploads')
 * - filenames?: string[] - 自定义文件名数组 (可选，与files数组对应)
 * - skipExisting?: boolean - 是否跳过已存在的文件 (可选，默认为false)
 */
export async function POST(request: NextRequest) {
  try {
    customLog(
      "api > admin > cf > multi-upload > POST",
      "开始处理统一文件上传请求"
    );

    // 解析 FormData
    const formData = await request.formData();

    // 提取并准备校验数据
    const files = formData.getAll("files") as File[];
    const names = formData.getAll("names") as string[] | undefined;

    const path = formData.get("path") as string;
    const skipExisting = formData.get("skipExisting") === "true";

    // 使用zod校验请求数据
    const validationResult = uploadSchema.safeParse({
      files,
      names,
      path,
      skipExisting,
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      customError(
        "api > admin > cf > multi-upload > POST",
        `参数校验失败: ${errorMessage}`
      );

      return NextResponse.json(Result.fail(`参数校验失败: ${errorMessage}`), {
        status: 400,
      });
    }

    const {
      files: validatedFiles,
      names: customFilenames,
      path: customPath,
      skipExisting: validatedSkipExisting,
    } = validationResult.data;

    customLog(
      "api > admin > cf > multi-upload > POST",
      `校验通过，准备上传 ${validatedFiles.length} 个文件到路径: ${customPath}`
    );

    // 检查自定义文件名是否有重复
    if (customFilenames && customFilenames.length > 0) {
      const validNames = customFilenames.filter(
        (name) => name && name.trim() !== ""
      );
      const nameSet = new Set(validNames);

      if (validNames.length !== nameSet.size) {
        customError(
          "api > admin > cf > multi-upload > POST",
          "自定义文件名中存在重复值"
        );
        return NextResponse.json({
          success: false,
          message: "自定义文件名不能有重复",
          status: 400,
        });
      }
    }

    // 记录自定义文件名信息
    const hasCustomFilenames =
      customFilenames && customFilenames.some((name) => name !== undefined);
    if (hasCustomFilenames) {
      customLog(
        "api > admin > cf > multi-upload > POST",
        `检测到自定义文件名: ${
          customFilenames!.filter((name) => name).length
        } 个`
      );
    }

    // 调用批量上传服务函数
    const uploadResult = await uploadMultipleFiles(
      validatedFiles,
      customPath,
      customFilenames,
      validatedSkipExisting
    );

    const {
      totalFiles,
      successCount,
      errorCount,
      skippedCount,
      results: uploadResults,
      errors: uploadErrors,
    } = uploadResult;

    customLog(
      "api > admin > cf > multi-upload > POST",
      `多文件上传完成: 成功 ${successCount}/${totalFiles}, 失败 ${errorCount}/${totalFiles}, 跳过 ${skippedCount}/${totalFiles}`
    );

    if (errorCount === 0) {
      // 全部成功
      customSuccess(
        "api > admin > cf > multi-upload > POST",
        "所有文件上传成功"
      );
      return NextResponse.json(
        Result.success({
          totalFiles,
          successCount,
          errorCount,
          skippedCount,
          results: uploadResults,
          errors: [],
          message: `所有文件上传成功: ${successCount}/${totalFiles}`,
        })
      );
    } else if (successCount === 0) {
      // 全部失败
      customError("api > admin > cf > multi-upload > POST", "所有文件上传失败");
      return NextResponse.json(
        {
          success: false,
          message:
            skippedCount > 0 ? "所有文件都已存在，已跳过" : "所有文件上传失败",
          data: {
            totalFiles,
            successCount,
            errorCount,
            skippedCount,
            results: [],
            errors: uploadErrors,
          },
        },
        { status: skippedCount > 0 ? 409 : 400 }
      );
    } else {
      // 部分成功
      customLog("api > admin > cf > multi-upload > POST", "部分文件上传成功");
      return NextResponse.json(
        {
          success: false,
          message: `部分文件上传成功: ${successCount}/${totalFiles}`,
          data: {
            totalFiles,
            successCount,
            errorCount,
            skippedCount,
            results: uploadResults,
            errors: uploadErrors,
          },
        },
        { status: 207 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "多文件上传失败";
    customError(
      "api > admin > cf > multi-upload > POST",
      `上传失败: ${errorMsg}`
    );

    return NextResponse.json(Result.fail(`多文件上传失败: ${errorMsg}`), {
      status: 500,
    });
  }
}

/**
 * GET /api/admin/cf/multi-upload
 * 获取多文件上传配置信息
 */
export async function GET() {
  try {
    const config = getUploadConfig();
    return NextResponse.json(Result.success(config));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "获取配置失败";
    customError("api > admin > cf > multi-upload > GET", errorMsg);

    return NextResponse.json(Result.fail(`获取配置失败: ${errorMsg}`), {
      status: 500,
    });
  }
}
