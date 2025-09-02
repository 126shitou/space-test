import { z } from "zod";
import { GenerationStatus } from "@/types/generation";
import { BaseTool } from "./base";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema/generation";
import { eq } from "drizzle-orm";
import { AIImageGeneratorConfig } from "@/lib/config/tool";

const { ratioOtions, formatOptions } = AIImageGeneratorConfig;

const AiImgGeneratorSchema = z.object({
  prompt: z.string().min(8).max(512, "提示文本不能超过512个字符"),
  ratio: z.enum(ratioOtions as [string, ...string[]], {
    errorMap: () => ({ message: "不支持的宽高比" }),
  }),
  count: z.number().min(1).max(4).default(1).optional(),
  format: z.enum(
    formatOptions.map((item) => item.value) as [string, ...string[]],
    {
      errorMap: () => ({ message: "不支持的输出格式" }),
    }
  ),
  quality: z.number().min(0).max(100).default(60).optional(),
  steps: z.number().min(1).max(4).default(3).optional(),
});

export class AiImgGeneratorTool implements BaseTool {
  getValidationSchema() {
    return AiImgGeneratorSchema;
  }

  buildTaskRequest(paramaters: any) {
    return {
      url: "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
        body: JSON.stringify({
          input: {
            prompt: paramaters.prompt,
            aspect_ratio: paramaters.ratio,
            num_outputs: paramaters.count,
            output_format: paramaters.format,
            output_quality: paramaters.quality,
          },
        }),
      },
    };
  }

  async processTaskResponse(response: any) {
    return {
      taskId: response.id,
    };
  }

  buildTaskStatusRequest(taskId: string) {
    return {
      url: `https://api.replicate.com/v1/predictions/${taskId}`,
      options: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
      },
    };
  }

  async processTaskStatusResponse(response: any, taskId?: string) {
    let status: GenerationStatus;
    let urls: string[] = [];

    if (
      !response.output ||
      (Array.isArray(response.output) &&
        response.output.length < response.input.num_outputs)
    ) {
      status = GenerationStatus.PROCESSING;
    } else {
      status = GenerationStatus.SUCCEED;
      urls = response.output;
    }

    // 更新数据库中的任务状态
    if (taskId) {
      try {
        await db
          .update(tasks)
          .set({
            status: status,
            updatedAt: new Date(),
          })
          .where(eq(tasks.taskId, taskId));
      } catch (error) {
        console.error("更新任务状态失败:", error);
      }
    }

    return {
      urls,
      status,
      type: "image",
    };
  }

  // 计算需要的积分
  calculatePoints(params: any): number {
    return 0;
  }
  // 获取返回的类型
  getReturnType(): "image" | "video" {
    return "image";
  }
}
