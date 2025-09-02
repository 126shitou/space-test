"use client";

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
interface ImageUploadProps {
  onChange?: (file: File | null) => void; // 统一的变化回调
  value?: File | string | null; // 当前值（可以是文件或预览URL）
  name?: string; // 组件名称
  maxSize?: number; // 最大文件大小（MB）
  accept?: string;
}

export default function ImageUpload({
  onChange,
  value,
  maxSize = 10,
  accept = "image/*",
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理value属性变化
  useEffect(() => {
    if (value instanceof File) {
      setCurrentFile(value);
      const url = URL.createObjectURL(value);
      setCurrentPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string") {
      setCurrentFile(null);
      setCurrentPreview(value);
    } else {
      setCurrentFile(null);
      setCurrentPreview(null);
    }
  }, [value]);

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
      setCurrentFile(file);
      const url = URL.createObjectURL(file);
      setCurrentPreview(url);

      // 调用回调函数
      onChange?.(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

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
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 清理状态
    setCurrentFile(null);
    setCurrentPreview(null);
    setUploadError(null);

    // 调用回调函数
    onChange?.(null);
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
                    relative cursor-pointer rounded-lg border-1 border-dashed hover:border-primary
                    ${
                      currentPreview
                        ? "border-0"
                        : ` ${
                            isDragOver
                              ? "border-primary bg-primary/5"
                              : "border-bd-p bg-b-p  hover:bg-primary/5"
                          }`
                    }
                `}
      >
        {currentPreview ? (
          <>
            {/* 预览图片 */}
            <div className="relative w-full overflow-hidden rounded-lg h-52 group flex items-center justify-center">
              <Image
                src={currentPreview}
                alt="Upload preview"
                className="max-h-full max-w-full object-contain"
                width={450}
                height={210}
                style={{
                  width: "auto",
                  height: "auto",
                }}
              />

              {/* 文件信息覆盖层 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white text-sm space-y-1">
                  {currentFile ? (
                    <>
                      <p className="font-medium truncate">{currentFile.name}</p>
                      <p className="text-xs opacity-90">
                        {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform   flex h-12 w-12 items-center justify-center rounded-full text-primary shadow-lg cursor-pointer"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 上传区域 - 固定高度 */}
            <div className="flex flex-col items-center justify-center py-8 px-6 h-52 group">
              <div
                className={cn(
                  "mb-4 rounded-full group-hover:text-primary",
                  isDragOver ? "bg-primary/20" : "bg-b-s"
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
        />
      </div>

      {/* 错误提示 */}
      {uploadError && (
        <div className="mt-2 text-sm text-red-500">{uploadError}</div>
      )}
    </div>
  );
}
