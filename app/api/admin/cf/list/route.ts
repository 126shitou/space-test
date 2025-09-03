import { NextRequest, NextResponse } from "next/server";
import { customError, customLog, customSuccess } from "@/lib/utils/log";
import { Result } from "@/lib/utils/result";
import { AwsClient } from "aws4fetch";

// Cloudflare R2 客户端配置
const r2Client = new AwsClient({
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  region: "auto",
  service: "s3",
});

// R2存储桶URL
const R2_URL = process.env.CLOUDFLARE_S3_URL!;

// XML解析函数
function parseListObjectsV2Response(xmlText: string) {
  // 简单的XML解析，提取Contents和CommonPrefixes
  const contents: Array<{
    Key: string;
    Size: number;
    LastModified: string;
    ETag: string;
  }> = [];
  const commonPrefixes: Array<{ Prefix: string }> = [];

  // 提取Contents
  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match;
  while ((match = contentsRegex.exec(xmlText)) !== null) {
    const contentXml = match[1];
    const key = contentXml.match(/<Key>(.*?)<\/Key>/)?.[1] || "";
    const size = parseInt(contentXml.match(/<Size>(.*?)<\/Size>/)?.[1] || "0");
    const lastModified =
      contentXml.match(/<LastModified>(.*?)<\/LastModified>/)?.[1] || "";
    const etag = contentXml.match(/<ETag>(.*?)<\/ETag>/)?.[1] || "";

    contents.push({
      Key: key,
      Size: size,
      LastModified: lastModified,
      ETag: etag,
    });
  }

  // 提取CommonPrefixes
  const prefixesRegex =
    /<CommonPrefixes><Prefix>(.*?)<\/Prefix><\/CommonPrefixes>/g;
  while ((match = prefixesRegex.exec(xmlText)) !== null) {
    commonPrefixes.push({ Prefix: match[1] });
  }

  // 提取其他字段
  const nextContinuationToken = xmlText.match(
    /<NextContinuationToken>(.*?)<\/NextContinuationToken>/
  )?.[1];
  const isTruncated =
    xmlText.match(/<IsTruncated>(.*?)<\/IsTruncated>/)?.[1] === "true";

  return {
    Contents: contents,
    CommonPrefixes: commonPrefixes,
    NextContinuationToken: nextContinuationToken,
    IsTruncated: isTruncated,
  };
}

// 文件信息接口
interface FileInfo {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  etag: string;
  url: string;
  type: "file";
}

// 目录信息接口
interface DirectoryInfo {
  key: string;
  name: string;
  type: "directory";
}

// 列表响应接口
interface ListResponse {
  files: FileInfo[];
  directories: DirectoryInfo[];
  totalCount: number;
  prefix?: string;
  continuationToken?: string;
  isTruncated: boolean;
}

/**
 * GET /api/admin/cf/list
 * 获取Cloudflare R2存储桶中的文件和目录列表
 *
 * 查询参数:
 * - prefix?: string - 路径前缀，用于获取特定目录下的内容
 * - maxKeys?: number - 最大返回数量，默认1000
 * - continuationToken?: string - 分页标记
 */
export async function GET(request: NextRequest) {
  try {
    customLog("api > admin > cf > list > GET", "开始获取R2存储桶文件列表");

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";
    const maxKeys = parseInt(searchParams.get("maxKeys") || "1000");
    const continuationToken =
      searchParams.get("continuationToken") || undefined;

    customLog(
      "api > admin > cf > list > GET",
      `查询参数: prefix=${prefix}, maxKeys=${maxKeys}, continuationToken=${
        continuationToken || "none"
      }`
    );

    // 构建查询参数
    const params = new URLSearchParams();
    params.append("list-type", "2");
    if (prefix) params.append("prefix", prefix);
    params.append("max-keys", maxKeys.toString());
    if (continuationToken)
      params.append("continuation-token", continuationToken);
    params.append("delimiter", "/"); // 使用分隔符来区分文件和目录

    // 构建请求URL
    const url = `${R2_URL}/${process.env
      .CLOUDFLARE_R2_BUCKET_NAME!}?${params.toString()}`;

    // 执行GET请求获取对象列表
    const response = await r2Client.fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `R2 API请求失败: ${response.status} ${response.statusText}`
      );
    }

    // 解析XML响应
    const xmlText = await response.text();
    const xmlResponse = parseListObjectsV2Response(xmlText);

    customLog(
      "api > admin > cf > list > GET",
      `获取到 ${xmlResponse.Contents?.length || 0} 个文件，${
        xmlResponse.CommonPrefixes?.length || 0
      } 个目录`
    );

    // 处理文件列表
    const files: FileInfo[] = (xmlResponse.Contents || []).map((object) => {
      const key = object.Key;
      const name = key.split("/").pop() || key;
      const publicUrl = `https://pub-d971bff5576c4337bba795092aa63092.r2.dev/${key}`;

      return {
        key,
        name,
        size: object.Size || 0,
        lastModified: object.LastModified || "",
        etag: object.ETag?.replace(/"/g, "") || "",
        url: publicUrl,
        type: "file" as const,
      };
    });

    // 处理目录列表
    const directories: DirectoryInfo[] = (xmlResponse.CommonPrefixes || []).map(
      (prefix) => {
        const key = prefix.Prefix;
        const name = key.replace(/\/$/, "").split("/").pop() || key;

        return {
          key,
          name,
          type: "directory" as const,
        };
      }
    );

    // 构建响应数据
    const listResponse: ListResponse = {
      files,
      directories,
      totalCount: files.length + directories.length,
      prefix: prefix || undefined,
      continuationToken: xmlResponse.NextContinuationToken,
      isTruncated: xmlResponse.IsTruncated || false,
    };

    customSuccess(
      "api > admin > cf > list > GET",
      `成功获取文件列表: ${files.length} 个文件，${directories.length} 个目录`
    );

    return NextResponse.json(Result.success(listResponse));
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "获取文件列表失败";
    customError(
      "api > admin > cf > list > GET",
      `获取文件列表失败: ${errorMsg}`
    );

    return NextResponse.json(Result.fail(`获取文件列表失败: ${errorMsg}`), {
      status: 500,
    });
  }
}

/**
 * POST /api/admin/cf/list
 * 批量获取文件详细信息
 *
 * 请求体:
 * - keys: string[] - 文件key列表
 */
export async function POST(request: NextRequest) {
  try {
    customLog("api > admin > cf > list > POST", "开始批量获取文件详细信息");

    const body = await request.json();
    const { keys } = body;

    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(Result.fail("请提供有效的文件key列表"), {
        status: 400,
      });
    }

    customLog(
      "api > admin > cf > list > POST",
      `批量查询 ${keys.length} 个文件的详细信息`
    );

    // 批量获取文件信息
    const fileDetails = await Promise.allSettled(
      keys.map(async (key: string) => {
        try {
          // 构建查询参数
          const params = new URLSearchParams();
          params.append("list-type", "2");
          params.append("prefix", key);
          params.append("max-keys", "1");

          // 构建请求URL
          const url = `${R2_URL}/${process.env
            .CLOUDFLARE_R2_BUCKET_NAME!}?${params.toString()}`;

          // 执行GET请求
          const response = await r2Client.fetch(url, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error(
              `R2 API请求失败: ${response.status} ${response.statusText}`
            );
          }

          // 解析XML响应
          const xmlText = await response.text();
          const xmlResponse = parseListObjectsV2Response(xmlText);
          const object = xmlResponse.Contents?.[0];

          if (!object) {
            throw new Error(`文件不存在: ${key}`);
          }

          const name = key.split("/").pop() || key;
          const publicUrl = `https://pub-d971bff5576c4337bba795092aa63092.r2.dev/${key}`;

          return {
            key,
            name,
            size: object.Size || 0,
            lastModified: object.LastModified || "",
            etag: object.ETag?.replace(/"/g, "") || "",
            url: publicUrl,
            type: "file" as const,
          };
        } catch (error) {
          throw new Error(
            `获取文件信息失败 ${key}: ${
              error instanceof Error ? error.message : "未知错误"
            }`
          );
        }
      })
    );

    // 处理结果
    const successResults: FileInfo[] = [];
    const errors: string[] = [];

    fileDetails.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successResults.push(result.value);
      } else {
        errors.push(`${keys[index]}: ${result.reason.message}`);
      }
    });

    customSuccess(
      "api > admin > cf > list > POST",
      `批量获取完成: 成功 ${successResults.length}/${keys.length} 个文件`
    );

    return NextResponse.json(
      Result.success({
        files: successResults,
        errors,
        totalRequested: keys.length,
        successCount: successResults.length,
        errorCount: errors.length,
      })
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "批量获取文件信息失败";
    customError(
      "api > admin > cf > list > POST",
      `批量获取文件信息失败: ${errorMsg}`
    );

    return NextResponse.json(Result.fail(`批量获取文件信息失败: ${errorMsg}`), {
      status: 500,
    });
  }
}
