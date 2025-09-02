export enum GenerationStatus {
  WAITING = "waiting",
  PROCESSING = "processing",
  SUCCEED = "succeed",
  FAILED = "failed",
  UNKNOWN = "unknown",
}

// 生成类型枚举
export enum GenerationType {
  TEXT_TO_VIDEO = "text-to-video",
  IMAGE_TO_VIDEO = "image-to-video",
  TEXT_TO_IMAGE = "text-to-image",
  IMAGE_TO_IMAGE = "image-to-image",
  VIDEO_TO_VIDEO = "video-to-video",
}

export type BuildTaskRequestOptions = {
  method: string;
  headers: Record<string, string>;
  body?: any;
};

export type RecordProcessingType = {
  urls: string[];
  type: string; // image/video
  status: GenerationStatus;
  error?: string;
} | null;

export type TaskStep = "none" | "createTask" | "pollTaskStatus";
