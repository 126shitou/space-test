"use client";
import { useEffect, useState } from "react";
import ToolLayout from "@/components/Layout/toolLayout";
import LeftPanel from "./LeftPanel";
import CenterPanel from "./CenterPanel";
import { useGenerate } from "@/hooks/useGenerate";
import { RecordProcessingType } from "@/types/generation";
import { toast } from "sonner";
import { getMediaInfoFromUrl } from "@/lib/utils/media-analyzer";
import { updateMediaAspectRatio } from "@/service/media";

export default function AiImgGeneratorClient() {
  const [taskData, setTaskData] = useState<RecordProcessingType>(null);
  const { handleGenerate, error, taskStep, pollTaskStatus } = useGenerate();

  const onGenerate = async (parametersValue: any) => {
    console.log("onChanges", parametersValue);
    const rid = await handleGenerate("ai-image-generator", parametersValue);
    console.log("record id", rid);
    if (!rid) {
      toast.error("生成失败");
      return;
    }
    const resData = await pollTaskStatus(rid);
    console.log("resData", resData);

    // 更新媒体文件的宽高比信息
    if (resData && resData.urls && resData.urls.length > 0) {
      try {
        // 遍历所有生成的媒体文件URL
        for (const url of resData.urls) {
          console.log("正在分析媒体文件:", url);

          // 获取媒体文件信息
          const mediaInfo = await getMediaInfoFromUrl(url);

          if (mediaInfo && mediaInfo.aspectRatio) {
            console.log("媒体信息:", mediaInfo);

            // 更新数据库中的宽高比信息
            const updateSuccess = await updateMediaAspectRatio(
              url,
              mediaInfo.aspectRatio
            );

            if (updateSuccess) {
              console.log(
                `媒体文件宽高比更新成功: ${url}, 宽高比: ${mediaInfo.aspectRatio}`
              );
            } else {
              console.warn(`媒体文件宽高比更新失败: ${url}`);
            }
          } else {
            console.warn(`无法获取媒体文件信息: ${url}`);
          }
        }
      } catch (error) {
        console.error("更新媒体宽高比时发生错误:", error);
        // 不影响主流程，只记录错误
      }
    }

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
      centerPanel={<CenterPanel taskStep={taskStep} taskData={taskData} />}
    />
  );
}
