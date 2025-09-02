import { Slider } from "@/components/ui/slider";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SlidersPanelProps {
  value?: number[];
  max?: number;
  step?: number;
  min?: number;
  onChange: (value: number) => void;
}

export default function SlidersPanel({
  value = [0], // 添加默认值
  max = 100,
  step = 1,
  min = 0,
  onChange,
}: SlidersPanelProps) {
  const handleChange = (value: number[]) => {
    onChange(value[0]);
  };

  return (
    <div className="w-full flex justify-center items-center gap-2">
      <Slider
        value={value}
        onValueChange={handleChange}
        max={max}
        step={step}
        min={min}
        className="w-full"
      />
      <div className="flex items-center border border-bd-p rounded overflow-hidden">
        {/* 数字显示框 */}
        <div className="w-8 h-6 text-center text-xs flex items-center justify-center bg-transparent">
          {value[0]}
        </div>
        {/* 上下箭头按钮容器 */}
        <div className="flex flex-col border-l border-bd-p">
          {/* 向上箭头按钮 */}
          <button
            onClick={() => {
              const newValue = Math.min(value[0] + step, max);
              onChange(newValue);
            }}
            className="px-1 py-0.5 hover:bg-btn-secondary-hover transition-colors cursor-pointer hover:text-primary"
          >
            <ChevronUp size={10} />
          </button>
          {/* 向下箭头按钮 */}
          <button
            onClick={() => {
              const newValue = Math.max(value[0] - step, min);
              onChange(newValue);
            }}
            className="px-1 py-0.5 hover:bg-btn-secondary-hover transition-colors border-t border-bd-p cursor-pointer hover:text-primary"
          >
            <ChevronDown size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
