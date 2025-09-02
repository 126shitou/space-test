import { Button } from "@/components/ui/button";
import ParameterRender, {
  ParameterRenderRef,
} from "@/components/t_p/ParameterRender";
import { config } from "./config";
import { useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // 添加loading图标
import { TaskStep } from "@/types/generation";

interface LeftPanelProps {
  onGenerate: (value: any) => void;
  taskStep?: TaskStep; // 添加loading状态prop
}

export default function LeftPanel({ onGenerate, taskStep }: LeftPanelProps) {
  // 创建 ParameterRender 组件的引用
  const parameterRenderRef = useRef<ParameterRenderRef>(null);

  // 处理生成按钮点击
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

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-10 pb-6 lg:pb-10">
      {/* 参数渲染区域 */}
      <div className="pt-4">
        <ParameterRender ref={parameterRenderRef} config={config} />
      </div>

      {/* Generate Button - 移动端优化触摸区域 */}
      <Button
        onClick={handleGenerate}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 lg:py-3 rounded-xl text-base lg:text-sm min-h-[48px] touch-manipulation"
        disabled={taskStep === "createTask"} // 添加loading禁用条件
      >
        {taskStep === "createTask" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm lg:text-base">生成中...</span>
          </>
        ) : (
          <span className="text-base lg:text-sm font-medium">Generate</span>
        )}
      </Button>
    </div>
  );
}
