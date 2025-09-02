import { ToolFactory } from "./base";
import { AiImgGeneratorTool } from "./ai-image-generator";
import { Veo3FastGeneratePreviewTool } from "./veo-3-fast-generate-preview";
import { AnimalsCaughtOnCameraTool } from "./effects/animals-caught-on-camera";
// 注册所有模型
ToolFactory.register("ai-image-generator", new AiImgGeneratorTool());
ToolFactory.register("veo-3-fast-generate-preview", new Veo3FastGeneratePreviewTool());
// 统一注册
ToolFactory.register("animals-caught-on-camera", new AnimalsCaughtOnCameraTool());

// 从模型提取UI配置的工具函数
export function getModelConfigFromModel(modelName: string) {
  const model = ToolFactory.getTool(modelName);
  return model || null;
}

// 导出工厂和类型
export { ToolFactory };
export * from "./base";
