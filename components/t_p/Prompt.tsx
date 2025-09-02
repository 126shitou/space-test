"use client";

import { cn } from "@/lib/utils";

// 定义组件props接口
interface PromptProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  name?: string;
}

export default function Prompt({
  value = "",
  onChange,
  placeholder = "",
  maxLength = 512,
 }: PromptProps) {
  const charCount = value.length;
  const isOverLimit = charCount >= maxLength;

  return (
    <div className="w-full rounded-2xl border border-bd-p overflow-hidden">
      <textarea
        rows={4}
        value={value}
        onChange={(e) => {
          // 限制输入长度，达到最大长度时不允许继续输入
          if (e.target.value.length <= maxLength) {
            onChange?.(e.target.value);
          }
        }}
        placeholder={placeholder}
        className="w-full focus:border-none focus:outline-none p-4 rounded-2xl text-t-p placeholder-t-m resize-none"
      />
      <div className="h-10 w-full px-2 flex justify-end items-center text-xs text-t-m">
        <div className="flex items-center space-x-2">
          <span
            className={cn("text-xs", isOverLimit ? "text-red-500" : "text-t-m")}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
