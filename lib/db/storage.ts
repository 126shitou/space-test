import { createClient } from "./supabase/server";
import { nanoid } from "nanoid";

// 文件类型配置
interface FileTypeConfig {
  allowedTypes: string[];
  maxSize: number; // 字节
}

// 预定义的文件类型配置
const FILE_CONFIGS: Record<string, FileTypeConfig> = {
  image: {
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  video: {
    allowedTypes: [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  audio: {
    allowedTypes: [
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/aac",
      "audio/flac",
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  document: {
    allowedTypes: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
};

// 上传结果接口
interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    fullUrl: string;
    publicUrl: string;
  };
  error?: string;
}

// 删除结果接口
interface DeleteResult {
  success: boolean;
  error?: string;
}

// 批量删除结果接口
interface BatchDeleteResult {
  success: boolean;
  successCount: number;
  failedPaths: string[];
  errors: string[];
}
const defaultBucketName = process.env.DEFAUTE_BUCKET_NAME || "";

export class SupabaseStorageManager {
  private bucketName: string;
  private supabase: any;

  constructor(bucketName: string = defaultBucketName) {
    this.bucketName = bucketName;
  }

  private async initializeClient() {
    this.supabase = await createClient();
  }

  /**
   * 验证文件类型和大小
   * @param file 文件对象
   * @param fileType 文件类型类别 ('image', 'video', 'audio', 'document')
   * @param customConfig 自定义配置（可选）
   * @returns 验证结果
   */
  validateFile(
    file: File,
    fileType: keyof typeof FILE_CONFIGS,
    customConfig?: Partial<FileTypeConfig>
  ): { isValid: boolean; error?: string } {
    const config = customConfig
      ? { ...FILE_CONFIGS[fileType], ...customConfig }
      : FILE_CONFIGS[fileType];

    if (!config) {
      return { isValid: false, error: `不支持的文件类型类别: ${fileType}` };
    }

    // 验证文件类型
    if (!config.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `不支持的文件类型: ${
          file.type
        }。支持的类型: ${config.allowedTypes.join(", ")}`,
      };
    }

    // 验证文件大小
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(2);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        error: `文件过大: ${fileSizeMB}MB。最大允许: ${maxSizeMB}MB`,
      };
    }

    return { isValid: true };
  }

  /**
   * 生成唯一文件路径
   * @param originalFileName 原始文件名
   * @param folder 文件夹路径（可选）
   * @param preserveOriginalName 是否保留原始文件名（默认false）
   * @returns 唯一文件路径
   */
  generateUniqueFilePath(
    originalFileName: string,
    folder?: string,
    preserveOriginalName: boolean = false
  ): string {
    const fileExtension =
      originalFileName.split(".").pop()?.toLowerCase() || "";
    const timestamp = Date.now();
    const uniqueId = nanoid(8); // 使用 nanoid 替代 uuid

    let fileName: string;
    if (preserveOriginalName) {
      const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, "");
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9\-_]/g, "_");
      fileName = `${sanitizedName}_${timestamp}_${uniqueId}.${fileExtension}`;
    } else {
      fileName = `${timestamp}_${uniqueId}.${fileExtension}`;
    }

    return folder
      ? `${folder.replace(/^\//g, "").replace(/\/$/, "")}/${fileName}`
      : fileName;
  }

  /**
   * 上传文件到 Supabase Storage
   * @param file 文件对象
   * @param filePath 文件路径
   * @param options 上传选项
   * @param options.upsert 是否覆盖已存在的同名文件，默认为 false
   * @param options.cacheControl 缓存控制策略（秒），默认为 "3600"（1小时）
   * @param options.contentType 文件的 MIME 类型，默认使用文件对象的 type
   * @returns 上传结果
   */
  async uploadFile(
    file: File,
    filePath: string,
    options: {
      upsert?: boolean;
      cacheControl?: string;
      contentType?: string;
    } = {}
  ): Promise<UploadResult> {
    try {
      if (!this.supabase) {
        await this.initializeClient();
      }

      const uploadOptions = {
        upsert: options.upsert || false,
        cacheControl: options.cacheControl || "3600",
        contentType: options.contentType || file.type,
      };

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, uploadOptions);

      if (error) {
        return {
          success: false,
          error: `上传失败: ${error.message}`,
        };
      }

      // 获取公共 URL
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        data: {
          path: data.path,
          fullUrl: data.fullPath,
          publicUrl: publicUrlData.publicUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `上传异常: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      };
    }
  }

  /**
   * 删除单个文件
   * @param filePath 文件路径
   * @returns 删除结果
   */
  async deleteFile(filePath: string): Promise<DeleteResult> {
    try {
      if (!this.supabase) {
        await this.initializeClient();
      }

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        return {
          success: false,
          error: `删除失败: ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `删除异常: ${
          error instanceof Error ? error.message : "未知错误"
        }`,
      };
    }
  }

  /**
   * 批量删除文件
   * @param filePaths 文件路径数组
   * @param continueOnError 遇到错误时是否继续删除其他文件
   * @returns 批量删除结果
   */
  async batchDeleteFiles(
    filePaths: string[],
    continueOnError: boolean = true
  ): Promise<BatchDeleteResult> {
    if (!filePaths.length) {
      return {
        success: true,
        successCount: 0,
        failedPaths: [],
        errors: [],
      };
    }

    try {
      if (!this.supabase) {
        await this.initializeClient();
      }

      if (!continueOnError) {
        // 一次性删除所有文件
        const { error } = await this.supabase.storage
          .from(this.bucketName)
          .remove(filePaths);

        if (error) {
          return {
            success: false,
            successCount: 0,
            failedPaths: filePaths,
            errors: [error.message],
          };
        }

        return {
          success: true,
          successCount: filePaths.length,
          failedPaths: [],
          errors: [],
        };
      } else {
        // 逐个删除，记录失败的文件
        const results = await Promise.allSettled(
          filePaths.map((path) => this.deleteFile(path))
        );

        const failedPaths: string[] = [];
        const errors: string[] = [];
        let successCount = 0;

        results.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value.success) {
            successCount++;
          } else {
            failedPaths.push(filePaths[index]);
            const errorMsg =
              result.status === "fulfilled"
                ? result.value.error || "未知错误"
                : result.reason?.message || "删除异常";
            errors.push(`${filePaths[index]}: ${errorMsg}`);
          }
        });

        return {
          success: failedPaths.length === 0,
          successCount,
          failedPaths,
          errors,
        };
      }
    } catch (error) {
      return {
        success: false,
        successCount: 0,
        failedPaths: filePaths,
        errors: [
          `批量删除异常: ${
            error instanceof Error ? error.message : "未知错误"
          }`,
        ],
      };
    }
  }
}

// 导出类和默认实例
export const storageManager = new SupabaseStorageManager();

// 导出文件类型配置，供外部使用
export { FILE_CONFIGS };

// 导出类型定义
export type { UploadResult, DeleteResult, BatchDeleteResult, FileTypeConfig };
