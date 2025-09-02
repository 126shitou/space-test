import { NextRequest, NextResponse } from "next/server";
import { Result } from "@/lib/utils/result";

/**
 * API接口: 获取远程媒体文件并返回blob数据
 * 用于解决前端直接请求远程媒体文件时的CORS问题
 * 支持图片、视频和音频文件
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // 验证URL格式
    if (!url || typeof url !== "string") {
      return NextResponse.json(Result.fail("无效的URL"), { status: 400 });
    }

    // 验证是否为有效的URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(Result.fail("URL格式不正确"), { status: 400 });
    }

    // 只允许HTTP和HTTPS协议
    if (!["http:", "https:"].includes(validUrl.protocol)) {
      return NextResponse.json(Result.fail("只支持HTTP和HTTPS协议"), {
        status: 400,
      });
    }

    console.log(`开始获取媒体文件: ${url}`);

    // 发起请求获取媒体文件
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/*,video/*,audio/*,*/*",
        "Accept-Encoding": "identity", // 避免压缩，直接获取原始数据
      },
      // 设置超时时间（30秒）
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        Result.fail(`请求失败: ${response.status} ${response.statusText}`),
        { status: response.status }
      );
    }

    // 检查内容类型
    const contentType = response.headers.get("content-type") || "";
    const contentLength = parseInt(
      response.headers.get("content-length") || "0"
    );

    // 验证是否为媒体文件
    if (
      !contentType.startsWith("image/") &&
      !contentType.startsWith("video/") &&
      !contentType.startsWith("audio/")
    ) {
      // 如果没有明确的媒体类型，检查URL扩展名
      const urlPath = validUrl.pathname.toLowerCase();
      const mediaExtensions = [
        // 图片格式
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".svg",
        ".ico",
        // 视频格式
        ".mp4",
        ".avi",
        ".mov",
        ".wmv",
        ".flv",
        ".webm",
        ".mkv",
        // 音频格式
        ".mp3",
        ".wav",
        ".ogg",
        ".aac",
        ".m4a",
      ];
      const hasMediaExtension = mediaExtensions.some((ext) =>
        urlPath.endsWith(ext)
      );

      if (!hasMediaExtension) {
        return NextResponse.json(
          Result.fail(`不支持的文件类型: ${contentType}`),
          { status: 400 }
        );
      }
    }

    // 检查文件大小限制（100MB）
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (contentLength > maxSize) {
      return NextResponse.json(
        Result.fail(
          `文件过大，最大支持100MB，当前文件: ${Math.round(
            contentLength / 1024 / 1024
          )}MB`
        ),
        { status: 413 }
      );
    }

    console.log(`开始流式传输媒体文件，内容类型: ${contentType}`);

    // 直接返回流式响应，避免Base64编码
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": contentLength.toString(),
        "Cache-Control": "public, max-age=31536000", // 缓存一年
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("获取媒体文件失败:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          Result.fail("请求超时，请检查网络连接或尝试更小的文件"),
          { status: 408 }
        );
      }
      return NextResponse.json(Result.fail(`网络错误: ${error.message}`), {
        status: 500,
      });
    }

    return NextResponse.json(Result.fail("未知错误，请稍后重试"), {
      status: 500,
    });
  }
}
