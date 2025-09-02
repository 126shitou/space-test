"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel?: ReactNode;
  leftClassName?: string;
}

export default function ToolLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftClassName,
}: ToolLayoutProps) {
  return (
    <div className="w-full h-full flex flex-col lg:flex-row min-h-[calc(100vh-var(--height-header))] gap-2 lg:gap-0">
      {/* 左侧面板 - 移动端全宽，桌面端固定宽度 */}
      {leftPanel && (
        <div
          className={cn("w-full lg:w-128 order-1 lg:order-none", leftClassName)}
        >
          {leftPanel}
        </div>
      )}

      {/* 中央面板 - 移动端全宽，桌面端弹性布局 */}
      {centerPanel && (
        <div className="flex-1 bg-[#f2f2f2] p-3 lg:p-6 rounded-2xl order-2 lg:order-none">
          <div className="h-full bg-white rounded-2xl ">{centerPanel}</div>
        </div>
      )}

      {/* 右侧面板 - 移动端隐藏，桌面端显示 */}
      {rightPanel && (
        <div className="hidden lg:block lg:w-90 order-3 lg:order-none">
          {rightPanel}
        </div>
      )}
    </div>
  );
}
