"use client";

import { AspectRatioOption } from "@/types/paramaters";
import { cn } from "@/lib/utils";

interface AspectRadioProps {
  value?: string;
  onChange?: (aspectRatio: string) => void;
  options?: AspectRatioOption[]; // 可选的自定义选项列表
}

export default function AspectRadio({
  value,
  onChange,
  options = [], // 默认为空数组
}: AspectRadioProps) {
  const handleSelect = (ratioValue: string) => {
    onChange?.(ratioValue);
  };

  const getRectangleStyle = (option: string) => {
    const [width, height] = option.split(":").map(Number);

    const style = {
      aspectRatio: `${width}/${height}`,
    };

    return style;
  };

  // 如果没有选项，返回空组件
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 w-full">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <div key={option.value} className="flex flex-col items-center gap-1">
            <div
              onClick={() => handleSelect(option.value)}
              className={cn(
                "border border-bd-p rounded-md w-full flex flex-col cursor-pointer hover:bg-primary/20 group transition-colors duration-200",
                isActive && "bg-primary/20 border-primary"
              )}
            >
              <div className=" w-full h-12 flex items-center justify-center ">
                <div
                  className={cn(
                    "rounded-sm group-hover:bg-primary bg-primary/30 h-8",
                    isActive && "bg-primary/70 "
                  )}
                  style={getRectangleStyle(option.value)}
                ></div>
              </div>
              <div
                className={cn(
                  "text-t-p text-sm text-center group-hover:text-primary ",
                  isActive && "text-primary"
                )}
              >
                {option.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
