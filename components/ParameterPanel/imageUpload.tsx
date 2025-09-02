"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageUpload?: (file: File) => void;
  onImageRemove?: () => void;
  maxSize?: number; // 最大文件大小（MB）
  accept?: string;
  preview?: string | null;
  fileName?: string; // 文件名
  fileSize?: number; // 文件大小（字节）
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  onImageUpload,
  onImageRemove,
  maxSize = 10,
  accept = "image/*",
  preview,
  fileName,
  fileSize,
  className = "",
  disabled = false,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setUploadError(null);

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      setUploadError("请选择图片文件");
      return false;
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileUpload = (file: File) => {
    if (validateFile(file)) {
      onImageUpload?.(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // 清空 input 值，允许重复选择同一文件
    e.target.value = "";
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageRemove?.();
    setUploadError(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
                    relative cursor-pointer rounded-lg border-1 border-dashed hover:border-primary
                    ${
                      preview
                        ? "border-0"
                        : ` ${
                            isDragOver && !disabled
                              ? "border-primary bg-primary/5"
                              : "border-bd-p bg-b-p  hover:bg-primary/5"
                          }`
                    }
                    ${disabled ? "cursor-not-allowed opacity-50" : ""}
                `}
      >
        {preview ? (
          <>
            {/* 预览图片 */}
            <div className="relative w-full overflow-hidden rounded-lg h-52 group flex items-center justify-center">
              <img
                src={preview}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />

              {/* 文件信息覆盖层 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white text-sm space-y-1">
                  {fileName ? (
                    <>
                      <p className="font-medium truncate">{fileName}</p>
                      {fileSize && (
                        <p className="text-xs opacity-90">
                          {(fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="font-medium truncate">已上传图片</p>
                      <p className="text-xs opacity-90">点击可重新选择文件</p>
                    </>
                  )}
                </div>
              </div>

              {/* Hover遮罩层和删除按钮 */}
              {!disabled && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={handleRemove}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform   flex h-12 w-12 items-center justify-center rounded-full text-primary shadow-lg cursor-pointer"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* 上传区域 - 固定高度 */}
            <div className="flex flex-col items-center justify-center py-8 px-6 h-52 group">
              <div
                className={cn(
                  "mb-4 rounded-full group-hover:text-primary",
                  isDragOver && !disabled ? "bg-primary/20" : "bg-b-s"
                )}
              >
                {isDragOver ? (
                  <Upload className="h-8 w-8 " />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
              </div>

              <p className="text-t-s  text-base group-hover:text-primary">
                {isDragOver ? "释放以上传图片" : "Click or drag image here"}
              </p>
              {/* <div className="text-center space-y-1">
                                <p className="text-t-s text-xs">
                                    支持 JPG、PNG、GIF 格式
                                </p>
                                <p className="text-t-s text-xs bg-b-s px-3 py-1 rounded-full inline-block">
                                    最大文件大小: {maxSize}MB
                                </p>
                            </div> */}
            </div>
          </>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* 错误提示 */}
      {uploadError && (
        <div className="mt-2 text-sm text-red-500">{uploadError}</div>
      )}
    </div>
  );
}
