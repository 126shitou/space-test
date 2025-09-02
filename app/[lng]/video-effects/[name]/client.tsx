"use client";
import ParameterPanel from "./ParameterPanel";
import VideoDisplay from "./videoDisplay";
import { useGenerate } from "@/hooks/useGenerate";
import { RecordProcessingType } from "@/types/generation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { type VideoEffect } from "@/lib/config/effects";

export default function VideoEffectsClient({
  selectedEffect,
}: {
  selectedEffect: VideoEffect;
}) {
  const [taskData, setTaskData] = useState<RecordProcessingType>(null);
  const { handleGenerate, error, taskStep, pollTaskStatus } = useGenerate();

  const onGenerate = async (parametersValue: any) => {
    console.log("onGenerate", parametersValue);

    return;
    parametersValue.image = await fileToBase64(parametersValue.image.file);
    console.log("onChanges", parametersValue);

    const rid = await handleGenerate(selectedEffect.id, parametersValue);
    if (!rid) {
      toast.error("生成失败");
      return;
    }

    const resData = await pollTaskStatus(rid);
    console.log("resData", resData);
    setTaskData(resData);
  };

  // 文件转base64的辅助函数（不包含Data URL前缀）
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          // 移除Data URL前缀，只保留base64编码部分
          const base64Data = reader.result.split(",")[1];
          resolve(base64Data);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="w-full flex flex-col lg:flex-row h-[calc(100vh-var(--height-header))]">
      {/* 左侧参数面板 - 移动端在上方，桌面端在左侧 */}
      <div className="w-full lg:w-120  ">
        <ParameterPanel
          onGenerate={onGenerate}
          taskStep={taskStep}
          selectedEffect={selectedEffect}
        />
      </div>

      {/* 中心内容区域 - 移动端在下方，桌面端在右侧 */}
      <div className="flex-1 bg-[#f2f2f2] p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl  ">
        <div className="h-full bg-white rounded-xl lg:rounded-2xl">
          <VideoDisplay
            taskStep={taskStep}
            taskData={taskData}
            selectedEffect={selectedEffect}
          />
        </div>
      </div>
    </div>
  );
}
