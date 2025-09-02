"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// 定义组件props接口
interface PromptProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
  recommendations?: string[];
  className?: string;
  showCharCount?: boolean;
  maxLength?: number;
  minLength?: number;
}

export default function Prompt({
  value = "",
  onChange,
  placeholder = "",
  title = "Prompt",
  className,
  showCharCount = false,
  maxLength = 512,
  minLength,
}: PromptProps) {
  const charCount = value.length;
  const isOverLimit = charCount > maxLength;
  const isUnderLimit = minLength
    ? charCount > 0 && charCount < minLength
    : false;

  return (
    <div className={cn("w-full", className)}>
      {/* 标题 */}
      <label className="leading-12 font-bold text-sm block mb-3">{title}</label>

      <div className="w-full rounded-2xl border border-bd-p overflow-hidden">
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full focus:border-none focus:outline-none p-4 rounded-2xl text-t-p placeholder-t-m resize-none"
        />
        <div className="h-10 w-full p-2 flex justify-between items-center text-xs text-t-m">
          <div className=" space-x-1">
            <span>Recommendation: </span>
            <span className="bg-btn-secondary/70 px-2 py-1 rounded-xs cursor-pointer hover:text-primary hover:bg-primary/30">
              Emotional film
            </span>
            <span className="bg-btn-secondary/70 px-2 py-1 rounded-xs cursor-pointer hover:text-primary hover:bg-primary/30">
              Seaside Illustration
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {showCharCount && (
              <span
                className={cn(
                  "text-xs",
                  isOverLimit
                    ? "text-red-500"
                    : isUnderLimit
                    ? "text-yellow-500"
                    : "text-t-m"
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
            <div className="hover:bg-btn-secondary/80 p-1 rounded-sm hover:text-primary">
              <RefreshCw size={16} className="cursor-pointer " />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
