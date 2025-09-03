import { useState } from "react";
import { ParameterValues } from "@/types/paramaters";
import { GenerationStatus, TaskStep } from "@/types/generation";
import { generateAction } from "@/service/generate";
import { getRecordStatusAction } from "@/service/record";

export const useGenerate = () => {
  const [taskStep, setTaskStep] = useState<TaskStep>("none");
  const [error, setError] = useState("");

  const handleGenerate = async (
    tool: string,
    parameters: ParameterValues,
    count: number = 1
  ) => {
    setTaskStep("createTask");
    setError(""); // 清除之前的错误状态

    try {
      // 创建FormData来调用生成Server Action
      const formData = new FormData();
      formData.append("tool", tool);
      formData.append("parameters", JSON.stringify(parameters));

      const result = await generateAction(formData);

      if (!result.success) {
        throw new Error(result.message || "生成任务失败");
      }

      console.log("useGenerate获取到了recordId", result.data);
      return result.data;
    } catch (error) {
      setTaskStep("none");
      setError(error instanceof Error ? error.message : String(error));
      return null;
    }
  };

  /**
   * 轮询查询任务生成状态
   * @param recordId - 任务记录ID，用于标识要查询的任务
   * @param onStatusUpdate - 可选的状态更新回调函数，每次查询后会调用此函数传递最新状态
   * @param maxAttempts - 最大轮询尝试次数，默认30次，防止无限轮询
   * @param interval - 轮询间隔时间（毫秒），默认2000ms（2秒）
   * @returns Promise<any> - 返回最终的任务状态数据
   */
  const pollTaskStatus = async (
    recordId: string,
    onStatusUpdate?: (status: any) => void,
    maxAttempts: number = 50,
    interval: number = 5000
  ) => {
    let attempts = 0;
    setTaskStep("pollTaskStatus");

    console.log("recordId", recordId);

    const poll = async (): Promise<any> => {
      try {
        attempts++;

        // 调用记录状态Server Action查询任务状态
        const result = await getRecordStatusAction(recordId);

        if (!result.success) {
          throw new Error(result.message || "状态查询失败");
        }

        const taskData = result.data;
        if (!taskData) {
          throw new Error("任务数据不存在");
        }

        // 调用状态更新回调
        if (onStatusUpdate) {
          onStatusUpdate(taskData);
        }

        // 检查任务是否完成（成功或失败）
        if (
          [GenerationStatus.FAILED, GenerationStatus.SUCCEED].includes(
            taskData.status as GenerationStatus
          )
        ) {
          setTaskStep("none");
          return taskData;
        }

        // 检查是否超过最大尝试次数
        if (attempts >= maxAttempts) {
          throw new Error(`轮询超时：已尝试 ${maxAttempts} 次，任务仍未完成`);
        }

        // 等待指定间隔后继续轮询
        await new Promise((resolve) => setTimeout(resolve, interval));
        return poll();
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
        setTaskStep("none");
        new Promise((resolve) => setTimeout(resolve, 0));
        throw error;
      }
    };

    return poll();
  };

  return {
    taskStep,
    error,
    handleGenerate,
    pollTaskStatus, // 添加轮询函数
  };
};
