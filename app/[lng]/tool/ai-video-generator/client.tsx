"use client";
import { useEffect, useState } from "react";
import ToolLayout from "@/components/Layout/toolLayout";
import LeftPanel from "./LeftPanel";
import CenterPanel from "./CenterPanel";
import { useGenerate } from "@/hooks/useGenerate";
import { RecordProcessingType } from "@/types/generation";
import { toast } from "sonner";

export default function AiVideoGeneratorClient() {
  const [recordId, setRecordId] = useState("");
  const [taskData, setTaskData] = useState<RecordProcessingType>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const { handleGenerate, error, taskStep, pollTaskStatus } = useGenerate();

  const onGenerate = async (parametersValue: any) => {
    console.log("onChanges", parametersValue);
     const rid = await handleGenerate(
      "veo-3-fast-generate-preview",
      parametersValue
    );
    if (!rid) {
      toast.error("生成任务失败");
      return;
    }
    setRecordId(rid);
    setGeneratedVideo(rid);
    console.log("recordId", recordId);
    const resData = await pollTaskStatus(rid);
    console.log("resData", resData);
    setTaskData(resData);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <ToolLayout
      leftPanel={
        <LeftPanel
          onGenerate={onGenerate}
          taskStep={taskStep} // 传递loading状态
        />
      }
      centerPanel={
        <CenterPanel
          taskStep={taskStep}
          taskData={taskData}
          generatedVideo={generatedVideo}
        />
      }
    />
  );
}
