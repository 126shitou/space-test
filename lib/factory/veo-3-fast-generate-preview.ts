import { z } from "zod";
import { GenerationStatus } from "@/types/generation";
import { BaseTool } from "./base";

export const ratioOtions = ["16:9"];

const Veo3FastGeneratePreviewSchema = z.object({
  prompt: z.string().max(512, "提示文本不能超过512个字符"),
  negativePrompt: z.string().max(512, "提示文本不能超过512个字符").optional(),
  ratio: z.enum(ratioOtions as [string, ...string[]], {
    errorMap: () => ({ message: "不支持的宽高比" }),
  }),
});

export class Veo3FastGeneratePreviewTool implements BaseTool {
  getValidationSchema() {
    return Veo3FastGeneratePreviewSchema;
  }

  buildTaskRequest(paramaters: any) {
    return {
      url: "https://generativelanguage.googleapis.com/v1beta/models/veo-3.0-fast-generate-preview:predictLongRunning",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": `${process.env.GEMINI_API_TOKEN}`,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: paramaters.prompt,
            },
          ],
          parameters: {
            aspectRatio: paramaters.ratio,
            negativePrompt: paramaters.negativePrompt,
          },
        }),
      },
    };
  }

  async processTaskResponse(response: any) {
    return {
      taskId: response.name,
    };
  }

  buildTaskStatusRequest(taskId: string) {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/${taskId}`,
      options: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": `${process.env.GEMINI_API_TOKEN}`,
        },
      },
    };
  }

  async processTaskStatusResponse(res: any, taskId?: string) {
    if (!res.done) {
      return {
        urls: [],
        status: GenerationStatus.PROCESSING,
        type: "video",
      };
    }

    return {
      urls: res.response.generateVideoResponse.generatedSamples[0].video.uri,
      status: GenerationStatus.SUCCEED,
      type: "video",
    };
  }

  // 计算需要的积分
  calculatePoints(params: any): number {
    return 0;
  }
  // 获取返回的类型
  getReturnType(): "image" | "video" {
    return "video";
  }
}
