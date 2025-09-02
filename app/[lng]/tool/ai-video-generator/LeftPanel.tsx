import { Button } from "@/components/ui/button";
import ParameterRender, {
  ParameterRenderRef,
} from "@/components/t_p/ParameterRender";
import ToggleGroup from "@/components/t_p/ToggleGroup";
import { config, modeOptions } from "./config";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TaskStep } from "@/types/generation";

interface LeftPanelProps {
  onGenerate: (value: any) => void;
  taskStep?: TaskStep;
}

export default function LeftPanel({ onGenerate, taskStep }: LeftPanelProps) {
  // 创建 ParameterRender 组件的引用
  const parameterRenderRef = useRef<ParameterRenderRef>(null);

  // 当前模式状态，用于控制图片上传的必需性和模式切换
  const [currentMode, setCurrentMode] = useState<string>("text-to-video");

  // 监听参数变化，获取当前模式
  useEffect(() => {
    if (parameterRenderRef.current) {
      const params = parameterRenderRef.current.getParameterValues();
      if (params.mode && params.mode !== currentMode) {
        setCurrentMode(params.mode);
      }
    }
  }, [currentMode]);

  // 自定义校验函数，处理image-to-video模式下的图片必需校验
  const customValidate = () => {
    if (!parameterRenderRef.current) return false;

    const params = parameterRenderRef.current.getParameterValues();

    // 基础校验
    if (!parameterRenderRef.current.validate()) {
      return false;
    }

    // 如果是image-to-video模式，检查是否上传了图片
    if (currentMode === "image-to-video" && !params.image) {
      toast.error("请在Image to video模式下上传图片");
      return false;
    }

    return true;
  };

  // 处理生成视频
  const handleGenerateVideo = () => {
    // 如果正在生成中，直接返回
    if (taskStep !== "none") {
      toast.error("请等待当前任务完成后再生成");
      return;
    }

    // 进行自定义校验
    if (customValidate()) {
      // 校验通过，获取参数值并添加模式
      const parameters = parameterRenderRef.current!.getParameterValues();
      const finalParameters = { ...parameters, mode: currentMode };
      console.log("Generate with parameters:", finalParameters);
      onGenerate(finalParameters);
    } else {
      toast.error("参数校验失败，请检查输入");
    }
  };

  return (
    <div className="space-y-4 px-10 pb-10">
      {/* 模式切换 */}
      <div className="pt-4">
        <ToggleGroup
          options={modeOptions}
          value={currentMode}
          onChange={(value) => {
            setCurrentMode(value as string);
            console.log("Mode changed to:", value);
          }}
        />
      </div>

      <ParameterRender 
          ref={parameterRenderRef} 
          config={config.filter(param => {
            // 只在image-to-video模式下显示图片上传组件
            if (param.id === 'image') {
              return currentMode === 'image-to-video';
            }
            return true;
          }).map(param => {
            // 根据模式动态设置参数必需性
            if (param.id === 'image') {
              return { ...param, required: currentMode === 'image-to-video' };
            }
            if (param.id === 'prompt') {
              return { ...param, required: currentMode === 'text-to-video' }; // 提示词在两种模式下都是必需的
            }
            return param;
          })} 
        />

      {/* Generate Button */}
      <Button
        onClick={handleGenerateVideo}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl"
        disabled={taskStep === "createTask"} // 添加loading禁用条件
      >
        {taskStep === "createTask" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          "Generate"
        )}
      </Button>
    </div>
  );
}
