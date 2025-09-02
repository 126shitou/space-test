import {
  AspectRatioOption,
  ToggleGroupOption,
  Parameter,
} from "@/types/paramaters";
import { AIImageGeneratorConfig } from "@/lib/config/tool";

const { ratioOtions, formatOptions: factoryFormatOptions } =
  AIImageGeneratorConfig;

// 宽高比选项配置
export const aspectRatioOptions: AspectRatioOption[] = ratioOtions.map(
  (ratio) => ({
    value: ratio,
    label: ratio,
  })
);

// 输出数量选项配置
export const numOutputsOptions: ToggleGroupOption[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

// 输出格式选项配置
export const formatOptions: ToggleGroupOption[] = factoryFormatOptions.map(
  (option) => ({
    value: option.value,
    label: option.label.toUpperCase(),
  })
);

// AI 图像生成器参数配置
export const config: Parameter[] = [
  {
    id: "prompt",
    name: "提示词",
    type: "prompt",
    maxLength: 512,
    minLength: 8,
    required: true,
    defaultValue: "",
    placeholder: "Describe what you want to create......",
  },
  {
    id: "ratio",
    name: "宽高比",
    type: "ratio",
    defaultValue: "1:1",
    options: ratioOtions.map((ratio) => ({
      value: ratio,
      label: ratio,
    })),
  },
  {
    id: "count",
    name: "输出数量",
    type: "toggleGroup",
    defaultValue: 1,
    options: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
    ],
  },
  {
    id: "steps",
    name: "推理步数",
    type: "slider",
    min: 1,
    max: 4,
    step: 1,
    defaultValue: 3,
  },
  {
    id: "format",
    name: "输出格式",
    type: "toggleGroup",
    required: false,
    defaultValue: "webp",
    options: factoryFormatOptions.map((option) => ({
      value: option.value,
      label: option.label.toUpperCase(),
    })),
  },
  {
    id: "quality",
    name: "输出质量",
    type: "slider",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 60,
  },
];
