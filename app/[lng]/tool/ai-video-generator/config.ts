import {
  AspectRatioOption,
  ToggleGroupOption,
  Parameter,
} from "@/types/paramaters";
import { ratioOtions } from "@/lib/factory/veo-3-fast-generate-preview";

// 模式选项配置
export const modeOptions: ToggleGroupOption[] = [
  { value: "text-to-video", label: "Text to Video" },
  { value: "image-to-video", label: "Image to video" },
];

// 宽高比选项配置
export const aspectRatioOptions: AspectRatioOption[] = ratioOtions.map(
  (ratio) => ({
    value: ratio,
    label: ratio,
  })
);

// 视频长度选项配置
export const videoLengthOptions: ToggleGroupOption[] = [
  { value: 8, label: "8s" },
];

// AI 视频生成器参数配置
export const config: Parameter[] = [
  {
    id: "image",
    name: "上传图片",
    type: "image",
    required: false, // 只有在image-to-video模式下才必需
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ["image/png", "image/jpeg", "image/jpg"],
  },
  {
    id: "prompt",
    name: "提示词",
    type: "prompt",
    maxLength: 512,
    required: true,
    defaultValue: "",
    placeholder: "Describe what you want to create......",
  },
  {
    id: "negativePrompt",
    name: "负面提示词",
    type: "prompt",
    maxLength: 512,
    required: false,
    defaultValue: "",
    placeholder: "Describe what you don't want......",
  },
  {
    id: "ratio",
    name: "宽高比",
    type: "ratio",
    defaultValue: "16:9",
    options: aspectRatioOptions,
  },
  {
    id: "videoLength",
    name: "视频长度",
    type: "toggleGroup",
    defaultValue: 8,
    options: videoLengthOptions,
  },
];