"use client";

// 媒体信息接口
export interface MediaInfo {
  videoWidth: number;
  videoHeight: number;
  duration: number;
  aspectRatio: string; // 直接返回字符串格式，如 "16:9"
  fileSize: number;
  fileName: string;
  fileType: string;
}

/**
 * 从URL获取媒体信息的主函数
 * @param url 媒体文件的URL地址
 * @returns Promise<MediaInfo | null> 返回媒体信息或null（失败时）
 */
export async function getMediaInfoFromUrl(
  url: string
): Promise<MediaInfo | null> {
  try {
    if (!url.trim()) {
      console.error("URL不能为空");
      return null;
    }

    // 调用API获取远程媒体文件（流式传输）
    const response = await fetch("/api/mediaBlob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url.trim() }),
    });

    if (!response.ok) {
      console.error("获取媒体文件失败:", response.status, response.statusText);
      return null;
    }

    // 直接从流式响应获取Blob
    const blob = await response.blob();
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    // 创建临时URL
    const blobUrl = URL.createObjectURL(blob);
    const fileName = url.split("/").pop() || "remote-media";

    // 根据内容类型选择合适的HTML元素
    const isImage = contentType.startsWith("image/");

    return new Promise((resolve) => {
      let element: HTMLImageElement | HTMLVideoElement;

      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        console.error("媒体文件加载超时");
        resolve(null);
      }, 30000);

      // 计算宽高比的通用函数
      const calculateAspectRatio = (width: number, height: number): string => {
        if (!width || !height) return "0:0";
        const gcd = (a: number, b: number): number => {
          return b === 0 ? a : gcd(b, a % b);
        };
        const divisor = gcd(width, height);
        return `${width / divisor}/${height / divisor}`;
      };

      if (isImage) {
        // 处理图片文件
        const img = document.createElement("img");
        img.style.display = "none";
        img.src = blobUrl;
        document.body.appendChild(img);
        element = img;

        img.addEventListener("load", () => {
          clearTimeout(timeout);

          const width = img.naturalWidth || 0;
          const height = img.naturalHeight || 0;
          const aspectRatio = calculateAspectRatio(width, height);

          console.log("图片宽高比:", width, height, aspectRatio);

          const mediaInfo: MediaInfo = {
            videoWidth: width,
            videoHeight: height,
            duration: 0, // 图片没有时长
            aspectRatio: aspectRatio,
            fileSize: blob.size,
            fileName: fileName,
            fileType: contentType,
          };

          cleanup();
          resolve(mediaInfo);
        });

        img.addEventListener("error", () => {
          clearTimeout(timeout);
          cleanup();
          console.error("图片文件加载失败");
          resolve(null);
        });
      } else {
        // 处理视频/音频文件
        const video = document.createElement("video");
        video.style.display = "none";
        video.src = blobUrl;
        document.body.appendChild(video);
        element = video;

        video.addEventListener("loadedmetadata", () => {
          clearTimeout(timeout);

          const width = video.videoWidth || 0;
          const height = video.videoHeight || 0;
          const aspectRatio = calculateAspectRatio(width, height);

          const mediaInfo: MediaInfo = {
            videoWidth: width,
            videoHeight: height,
            duration: video.duration || 0,
            aspectRatio: aspectRatio,
            fileSize: blob.size,
            fileName: fileName,
            fileType: contentType,
          };

          cleanup();
          resolve(mediaInfo);
        });

        video.addEventListener("error", () => {
          clearTimeout(timeout);
          cleanup();
          console.error("视频/音频文件加载失败");
          resolve(null);
        });
      }
    });
  } catch (error) {
    console.error("处理媒体文件时发生错误:", error);
    return null;
  }
}
