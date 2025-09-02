"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

/**
 * 自定义Toast组件，为所有toast类型提供固定的背景色样式
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      offset={80}
      duration={2000}
      toastOptions={{
        style: {
          minWidth: "200px",
          maxWidth: "400px",
          minHeight: "60px",
          maxHeight: "80px",
          fontSize: "14px",
          padding: "12px 16px",
        },
        classNames: {
          // 成功类型的toast样式
          success:
            "!bg-green-100 !text-green-900 !border-green-300 shadow-lg !text-sm !py-3 !px-4",
          // 错误类型的toast样式
          error:
            "!bg-red-100 !text-red-900 !border-red-300 shadow-lg !text-sm !py-3 !px-4",
          // 警告类型的toast样式
          warning:
            "!bg-yellow-100 !text-yellow-900 !border-yellow-300 shadow-lg !text-sm !py-3 !px-4",
          // 信息类型的toast样式
          info: "!bg-blue-100 !text-blue-900 !border-blue-300 shadow-lg !text-sm !py-3 !px-4",
          // 默认toast样式
          toast:
            "!bg-gray-100 !text-gray-900 !border-gray-300 shadow-lg !text-sm !py-3 !px-4",
          // 描述文字样式
          description: "!text-gray-700 !text-xs",
          // 动作按钮样式
          actionButton:
            "!bg-gray-800 !text-white hover:!bg-gray-700 !text-xs !px-3 !py-1",
          // 取消按钮样式
          cancelButton:
            "!bg-gray-200 !text-gray-700 hover:!bg-gray-300 !text-xs !px-3 !py-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
