import { NextRequest, NextResponse } from "next/server";
import { customError, customLog, customSuccess } from "@/lib/utils/log";
import { Result } from "@/lib/utils/result";
import { z } from "zod";

// 导入aws4fetch用于与Cloudflare R2交互
import { AwsClient } from "aws4fetch";

// 创建R2客户端
const r2Client = new AwsClient({
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  region: "auto",
  service: "s3",
});

// R2存储桶URL
const R2_URL = process.env.CLOUDFLARE_S3_URL!;

// 批量删除请求的验证schema
const batchDeleteSchema = z.object({
  keys: z
    .array(z.string().min(1, "文件路径不能为空"))
    .min(1, "至少需要删除一个文件")
    .max(100, "单次最多只能删除100个文件"),
});

// 单个删除请求的验证schema
const singleDeleteSchema = z.object({
  key: z.string().min(1, "文件路径不能为空"),
});

/**
 * 删除单个文件
 * @param key 文件在R2中的完整路径
 * @returns 删除结果
 */
async function deleteSingleFile(key: string): Promise<{
  key: string;
  success: boolean;
  error?: string;
}> {
  try {
    customLog(
      "api > admin > cf > delete > deleteSingleFile",
      `开始删除文件: ${key}`
    );

    // 构建删除请求URL
    const url = `${R2_URL}/${process.env.CLOUDFLARE_R2_BUCKET_NAME!}/${key}`;

    // 执行DELETE请求
    const response = await r2Client.fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`删除请求失败: ${response.status} ${response.statusText}`);
    }

    customSuccess(
      "api > admin > cf > delete > deleteSingleFile",
      `文件删除成功: ${key}`
    );

    return {
      key,
      success: true,
    };
  } catch (error: any) {
    customError(
      "api > admin > cf > delete > deleteSingleFile",
      `文件删除失败: ${key} - ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );

    return {
      key,
      success: false,
      error: error.message || "删除失败",
    };
  }
}

/**
 * 批量删除文件（使用AWS SDK的批量删除功能）
 * @param keys 要删除的文件路径数组
 * @returns 删除结果
 */
async function batchDeleteFiles(keys: string[]): Promise<{
  successCount: number;
  failureCount: number;
  results: Array<{
    key: string;
    success: boolean;
    error?: string;
  }>;
}> {
  try {
    customLog(
      "api > admin > cf > delete > batchDeleteFiles",
      `开始批量删除 ${keys.length} 个文件`
    );

    // 使用并发删除替代批量删除功能
    const results = await Promise.all(
      keys.map(async (key) => {
        try {
          // 构建删除请求URL
          const url = `${R2_URL}/${process.env.CLOUDFLARE_R2_BUCKET_NAME!}/${key}`;

          // 执行DELETE请求
          const response = await r2Client.fetch(url, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(`删除请求失败: ${response.status} ${response.statusText}`);
          }

          return {
            key,
            success: true,
          };
        } catch (error: any) {
          return {
            key,
            success: false,
            error: error.message || "删除失败",
          };
        }
      })
    );

    // 统计结果
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    customSuccess(
      "api > admin > cf > delete > batchDeleteFiles",
      `批量删除完成: 成功 ${successCount} 个，失败 ${failureCount} 个`
    );

    return {
      successCount,
      failureCount,
      results,
    };
  } catch (error: any) {
    customError(
      "api > admin > cf > delete > batchDeleteFiles",
      `批量删除过程中发生错误: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );

    // 如果批量删除失败，回退到逐个删除
    customLog(
      "api > admin > cf > delete > batchDeleteFiles",
      "批量删除失败，回退到逐个删除模式"
    );

    const results = await Promise.all(keys.map((key) => deleteSingleFile(key)));

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return {
      successCount,
      failureCount,
      results,
    };
  }
}

/**
 * DELETE /api/admin/cf/delete
 * 删除文件接口
 *
 * 支持两种模式：
 * 1. 单个删除：传递 key 参数
 * 2. 批量删除：传递 keys 数组参数
 */
export async function DELETE(request: NextRequest) {
  try {
    customLog("api > admin > cf > delete > DELETE", "收到删除文件请求");

    // 检查环境变量
    if (
      !process.env.CLOUDFLARE_R2_BUCKET_NAME ||
      !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
      !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
      !process.env.CLOUDFLARE_S3_URL
    ) {
      customError(
        "api > admin > cf > delete > DELETE",
        "Cloudflare R2配置不完整"
      );
      return NextResponse.json(Result.fail("服务器配置错误"), {
        status: 500,
      });
    }

    const body = await request.json();
    customLog(
      "api > admin > cf > delete > DELETE",
      `请求参数: ${JSON.stringify(body)}`
    );

    // 判断是单个删除还是批量删除
    if (body.keys && Array.isArray(body.keys)) {
      // 批量删除模式
      const validationResult = batchDeleteSchema.safeParse(body);
      if (!validationResult.success) {
        customError(
          "api > admin > cf > delete > DELETE",
          `批量删除参数校验失败: ${JSON.stringify(
            validationResult.error.errors
          )}`
        );
        return NextResponse.json(
          Result.fail(
            `参数校验失败: ${JSON.stringify(validationResult.error.errors)}`
          ),
          {
            status: 400,
          }
        );
      }

      const { keys } = validationResult.data;

      // 检查是否有重复的key
      const uniqueKeys = [...new Set(keys)];
      if (uniqueKeys.length !== keys.length) {
        customError(
          "api > admin > cf > delete > DELETE",
          "删除列表中存在重复的文件路径"
        );
        return NextResponse.json(
          Result.fail("删除列表中不能有重复的文件路径"),
          {
            status: 400,
          }
        );
      }

      // 执行批量删除
      const result = await batchDeleteFiles(uniqueKeys);

      return NextResponse.json(
        Result.success(
          {
            totalFiles: uniqueKeys.length,
            successCount: result.successCount,
            failureCount: result.failureCount,
            results: result.results,
          },
          `批量删除完成: 成功 ${result.successCount} 个，失败 ${result.failureCount} 个`
        ),
        {
          status: 200,
        }
      );
    } else if (body.key && typeof body.key === "string") {
      // 单个删除模式
      const validationResult = singleDeleteSchema.safeParse(body);
      if (!validationResult.success) {
        customError(
          "api > admin > cf > delete > DELETE",
          `单个删除参数校验失败: ${JSON.stringify(
            validationResult.error.errors
          )}`
        );
        return NextResponse.json(
          Result.fail(
            `参数校验失败: ${JSON.stringify(validationResult.error.errors)}`
          ),
          {
            status: 400,
          }
        );
      }

      const { key } = validationResult.data;

      // 执行单个删除
      const result = await deleteSingleFile(key);

      if (result.success) {
        return NextResponse.json(Result.success(result, "文件删除成功"), {
          status: 200,
        });
      } else {
        return NextResponse.json(Result.fail(result.error || "文件删除失败"), {
          status: 400,
        });
      }
    } else {
      customError(
        "api > admin > cf > delete > DELETE",
        "请求参数格式错误：需要提供 key 或 keys 参数"
      );
      return NextResponse.json(
        Result.fail(
          "请求参数格式错误：需要提供 key（单个删除）或 keys（批量删除）参数"
        ),
        {
          status: 400,
        }
      );
    }
  } catch (error: any) {
    customError(
      "api > admin > cf > delete > DELETE",
      `删除文件过程中发生未知错误: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );
    return NextResponse.json(Result.fail("服务器内部错误"), {
      status: 500,
    });
  }
}

/**
 * GET /api/admin/cf/delete
 * 获取删除接口的配置信息和使用说明
 */
export async function GET() {
  try {
    customLog("api > admin > cf > delete > GET", "获取删除接口配置信息");

    return NextResponse.json(
      Result.success(
        {
          endpoint: "/api/admin/cf/delete",
          method: "DELETE",
          description: "Cloudflare R2文件删除接口",
          modes: {
            single: {
              description: "单个文件删除",
              parameters: {
                key: "string - 要删除的文件在R2中的完整路径",
              },
              example: {
                key: "uploads/image.jpg",
              },
            },
            batch: {
              description: "批量文件删除",
              parameters: {
                keys: "string[] - 要删除的文件路径数组（最多100个）",
              },
              example: {
                keys: ["uploads/image1.jpg", "uploads/image2.jpg"],
              },
            },
          },
          limits: {
            maxBatchSize: 100,
            supportedOperations: ["单个删除", "批量删除"],
          },
          environment: {
            bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "未配置",
            endpoint: process.env.CLOUDFLARE_S3_URL || "未配置",
            configured: !!(
              process.env.CLOUDFLARE_R2_BUCKET_NAME &&
              process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
              process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
              process.env.CLOUDFLARE_S3_URL
            ),
          },
        },
        "删除接口配置信息"
      ),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    customError(
      "api > admin > cf > delete > GET",
      `获取配置信息时发生错误: ${
        error instanceof Error ? error.message : JSON.stringify(error)
      }`
    );
    return NextResponse.json(Result.fail("获取配置信息失败"), {
      status: 500,
    });
  }
}
