import { z } from "zod";
import { GenerationStatus } from "@/types/generation";
import { BaseTool } from "../base";
import { customSuccess } from "../../utils";

const AnimalsCaughOnCamerSchema = z.object({
  image: z.string().min(1, "图片不能为空"),
});

export class AnimalsCaughtOnCameraTool implements BaseTool {
  getValidationSchema() {
    return AnimalsCaughOnCamerSchema;
  }

  buildTaskRequest(paramaters: any) {
    return {
      url: "https://api.apicore.ai/kling/v1/videos/multi-image2video",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_CORE_TOKEN}`,
        },
        body: JSON.stringify({
          model_name: "kling-v1-6",
          image_list: [{ image: paramaters.image }],
          prompt:
            "Night-vision surveillance footage, backyard scene, the main figure from the reference image bouncing on a trampoline, grainy green-tinted CCTV aesthetic, motion blur, timestamp overlay, low-resolution quality.",
        }),
      },
    };
  }

  async processTaskResponse(response: any) {
    customSuccess("animals caught on camera", JSON.stringify(response));
    return {
      taskId: response.data.task_id,
    };
  }

  buildTaskStatusRequest(taskId: string) {
    return {
      url: `https://api.apicore.ai/kling/v1/videos/multi-image2video/${taskId}`,
      authHeader: { Authorization: `Bearer ${process.env.API_CORE_TOKEN}` },
      options: {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_CORE_TOKEN}`,
        },
      },
    };
  }

  async processTaskStatusResponse(res: any, taskId?: string) {
    if (res.code == 0 && ["succeed", "failed"].includes(res.data.task_status)) {
      const urls = res.data.task_result.videos.map((i: any) => i.url);
      return {
        urls: urls,
        status:
          res.data.task_status == "succeed"
            ? GenerationStatus.SUCCEED
            : GenerationStatus.FAILED,
        type: "video",
      };
    }

    return {
      urls: [],
      status: GenerationStatus.PROCESSING,
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
