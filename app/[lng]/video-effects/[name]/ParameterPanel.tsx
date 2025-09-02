"use client";
import { useRef } from "react";
import EffectSelect from "@/components/EffectSelect";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TaskStep } from "@/types/generation";
import { useRouter } from "next/navigation";
import { videoEffectsData } from "@/lib/config/effects";
import ParamaterRender, {
  ParameterRenderRef,
} from "@/components/t_p/ParameterRender";

export default function LeftPanel({
  onGenerate,
  taskStep,
  selectedEffect,
}: {
  onGenerate: (parametersValue: any) => void;
  taskStep: TaskStep;
  selectedEffect: any;
}) {
  const router = useRouter();
  // 创建 ParameterRender 组件的引用
  const parameterRenderRef = useRef<ParameterRenderRef>(null);

  const handleGenerate = () => {
    // 如果正在生成中，直接返回
    if (taskStep !== "none") {
      toast.error("请等待当前任务完成后再生成");
      return;
    }

    // 通过 ref 进行参数校验
    if (parameterRenderRef.current?.validate()) {
      // 校验通过，获取参数值
      const parameters = parameterRenderRef.current.getParameterValues();
      console.log("Generate with parameters:", parameters);
      onGenerate(parameters);
    } else {
      toast.error("参数校验失败，请检查输入");
    }
  };

  const effectChange = (effect: any) => {
    router.push(`/video-effects/${effect.title}`);
  };

  return (
    <div className="h-full p-3 sm:p-4 lg:p-4 flex flex-col">
      <div>
        <span className="leading-12 font-bold text-xs sm:text-sm block mb-2 sm:mb-3">
          Effects
        </span>
        <EffectSelect
          effects={videoEffectsData}
          selectedEffect={selectedEffect}
          onEffectSelect={effectChange}
        />
      </div>

      {/* 参数渲染区域 */}
      <div className="pt-3 sm:pt-4 flex-1">
        <ParamaterRender
          ref={parameterRenderRef}
          config={selectedEffect?.parameters || []}
        />
      </div>

      <Button
        onClick={handleGenerate}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 sm:py-3 rounded-xl mt-4 sm:mt-6 lg:mt-8 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base touch-manipulation"
        disabled={taskStep === "createTask"} // 添加loading禁用条件
      >
        {taskStep === "createTask" ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            <span className="text-xs sm:text-sm">生成中...</span>
          </>
        ) : (
          <span className="text-sm sm:text-base">Generate</span>
        )}
      </Button>
    </div>
  );
}
