import { useState } from "react";
import { ParameterValues } from "@/types/paramaters";
import { GenerationStatus, TaskStep } from "@/types/generation";

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
      // 调用生成API创建任务
      const response = await fetch("/api/thirdApi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool, parameters, count }),
      });

      if (!response.ok) {
        let errorMessage = `生成请求失败: ${response.status} ${response.statusText}`;
        const errorData = await response.json();

        if (errorData?.message) {
          errorMessage = errorData.message;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

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

        // 发送POST请求查询任务状态
        const response = await fetch(`/api/thirdApi/record/${recordId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `状态查询失败: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "状态查询失败");
        }

        const taskData = result.data;

        // 调用状态更新回调
        if (onStatusUpdate) {
          onStatusUpdate(taskData);
        }

        // 检查任务是否完成（成功或失败）
        if (
          [GenerationStatus.FAILED, GenerationStatus.SUCCEED].includes(
            taskData.status
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
