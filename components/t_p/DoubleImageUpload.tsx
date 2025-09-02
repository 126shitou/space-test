"use client";

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// 双图片上传组件的属性接口
interface DoubleImageUploadProps {
  onChange?: (files: { left: File | null; right: File | null }) => void; // 图片变化回调
  value?: { left: File | string | null; right: File | string | null }; // 当前值
  maxSize?: number; // 最大文件大小（MB）
  accept?: string; // 接受的文件类型
  leftLabel?: string; // 左侧标签
  rightLabel?: string; // 右侧标签
}

export default function DoubleImageUpload({
  onChange,
  value,
  maxSize = 10,
  accept = "image/*",
  leftLabel = "Left Person",
  rightLabel = "Right Person",
}: DoubleImageUploadProps) {
  // 从value中提取左右值
  const leftValue = value?.left;
  const rightValue = value?.right;

  // 统一的onChange处理函数
  const handleChange = (newLeft: File | null, newRight: File | null) => {
    onChange?.({ left: newLeft, right: newRight });
  };

  // 左侧图片状态
  const [leftIsDragOver, setLeftIsDragOver] = useState(false);
  const [leftUploadError, setLeftUploadError] = useState<string | null>(null);
  const [leftCurrentFile, setLeftCurrentFile] = useState<File | null>(null);
  const [leftCurrentPreview, setLeftCurrentPreview] = useState<string | null>(
    null
  );
  const leftFileInputRef = useRef<HTMLInputElement>(null);

  // 右侧图片状态
  const [rightIsDragOver, setRightIsDragOver] = useState(false);
  const [rightUploadError, setRightUploadError] = useState<string | null>(null);
  const [rightCurrentFile, setRightCurrentFile] = useState<File | null>(null);
  const [rightCurrentPreview, setRightCurrentPreview] = useState<string | null>(
    null
  );
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // 处理左侧value属性变化
  useEffect(() => {
    if (leftValue instanceof File) {
      setLeftCurrentFile(leftValue);
      const url = URL.createObjectURL(leftValue);
      setLeftCurrentPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof leftValue === "string") {
      setLeftCurrentFile(null);
      setLeftCurrentPreview(leftValue);
    } else {
      setLeftCurrentFile(null);
      setLeftCurrentPreview(null);
    }
  }, [leftValue]);

  // 处理右侧value属性变化
  useEffect(() => {
    if (rightValue instanceof File) {
      setRightCurrentFile(rightValue);
      const url = URL.createObjectURL(rightValue);
      setRightCurrentPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof rightValue === "string") {
      setRightCurrentFile(null);
      setRightCurrentPreview(rightValue);
    } else {
      setRightCurrentFile(null);
      setRightCurrentPreview(null);
    }
  }, [rightValue]);

  // 文件验证函数
  const validateFile = (file: File, side: "left" | "right"): boolean => {
    const setError = side === "left" ? setLeftUploadError : setRightUploadError;
    setError(null);

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return false;
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    return true;
  };

  // 左侧文件上传处理
  const handleLeftFileUpload = (file: File) => {
    if (validateFile(file, "left")) {
      setLeftCurrentFile(file);
      const url = URL.createObjectURL(file);
      setLeftCurrentPreview(url);
      handleChange(file, rightCurrentFile);
    }
  };

  // 右侧文件上传处理
  const handleRightFileUpload = (file: File) => {
    if (validateFile(file, "right")) {
      setRightCurrentFile(file);
      const url = URL.createObjectURL(file);
      setRightCurrentPreview(url);
      handleChange(leftCurrentFile, file);
    }
  };

  // 左侧拖拽事件处理
  const handleLeftDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLeftIsDragOver(true);
  };

  const handleLeftDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLeftIsDragOver(false);
  };

  const handleLeftDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLeftIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleLeftFileUpload(files[0]);
    }
  };

  // 右侧拖拽事件处理
  const handleRightDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setRightIsDragOver(true);
  };

  const handleRightDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setRightIsDragOver(false);
  };

  const handleRightDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setRightIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleRightFileUpload(files[0]);
    }
  };

  // 文件选择事件处理
  const handleLeftFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleLeftFileUpload(files[0]);
    }
    e.target.value = "";
  };

  const handleRightFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleRightFileUpload(files[0]);
    }
    e.target.value = "";
  };

  // 点击事件处理
  const handleLeftClick = () => {
    leftFileInputRef.current?.click();
  };

  const handleRightClick = () => {
    rightFileInputRef.current?.click();
  };

  // 删除事件处理
  const handleLeftRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLeftCurrentFile(null);
    setLeftCurrentPreview(null);
    setLeftUploadError(null);
    handleChange(null, rightCurrentFile);
  };

  const handleRightRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRightCurrentFile(null);
    setRightCurrentPreview(null);
    setRightUploadError(null);
    handleChange(leftCurrentFile, null);
  };

  // 交换图片功能
  const handleSwapImages = () => {
    // 交换文件
    const tempFile = leftCurrentFile;
    setLeftCurrentFile(rightCurrentFile);
    setRightCurrentFile(tempFile);

    // 交换预览
    const tempPreview = leftCurrentPreview;
    setLeftCurrentPreview(rightCurrentPreview);
    setRightCurrentPreview(tempPreview);

    // 调用回调函数
    handleChange(rightCurrentFile, tempFile);
  };

  // 单个上传区域渲染函数
  const renderUploadArea = (
    label: string,
    isDragOver: boolean,
    currentPreview: string | null,
    currentFile: File | null,
    uploadError: string | null,
    onDragOver: (e: DragEvent<HTMLDivElement>) => void,
    onDragLeave: (e: DragEvent<HTMLDivElement>) => void,
    onDrop: (e: DragEvent<HTMLDivElement>) => void,
    onClick: () => void,
    onRemove: (e: React.MouseEvent) => void,
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="flex-1">
      {/* 上传区域 */}
      <div className="relative">
        <div
          onClick={onClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative cursor-pointer rounded-lg border border-dashed hover:border-primary transition-colors
            ${
              currentPreview
                ? "border-0"
                : `${
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 bg-gray-50 hover:bg-primary/5"
                  }`
            }
          `}
        >
          {currentPreview ? (
            <>
              {/* 预览图片 */}
              <div className="relative w-full overflow-hidden rounded-lg h-48 group flex items-center justify-center">
                <Image
                  src={currentPreview}
                  alt={`${label} preview`}
                  className="max-h-full max-w-full object-contain"
                  width={300}
                  height={192}
                  style={{
                    width: "auto",
                    height: "auto",
                  }}
                />

                {/* 文件信息覆盖层 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white text-xs space-y-1">
                    {currentFile ? (
                      <>
                        <p className="font-medium truncate">
                          {currentFile.name}
                        </p>
                        <p className="opacity-90">
                          {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium truncate">已上传图片</p>
                        <p className="opacity-90">点击可重新选择文件</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Hover遮罩层和删除按钮 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 上传区域 */}
              <div className="flex flex-col items-center justify-center py-6 px-4 h-48 group">
                <div
                  className={cn(
                    "mb-3 p-3 rounded-full group-hover:text-primary transition-colors",
                    isDragOver
                      ? "bg-primary/20 text-primary"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isDragOver ? (
                    <Upload className="h-6 w-6" />
                  ) : (
                    <ImageIcon className="h-6 w-6" />
                  )}
                </div>

                <p className="text-sm font-medium group-hover:text-primary text-gray-700">
                  {label}
                </p>
              </div>
            </>
          )}

          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={onFileSelect}
            className="hidden"
          />
        </div>

        {/* 错误提示 */}
        {uploadError && (
          <div className="mt-2 text-sm text-red-500 text-center">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {/* 左侧上传区域 */}
        {renderUploadArea(
          leftLabel,
          leftIsDragOver,
          leftCurrentPreview,
          leftCurrentFile,
          leftUploadError,
          handleLeftDragOver,
          handleLeftDragLeave,
          handleLeftDrop,
          handleLeftClick,
          handleLeftRemove,
          leftFileInputRef,
          handleLeftFileSelect
        )}

        {/* 中间交换按钮 */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={handleSwapImages}
            disabled={!leftCurrentPreview && !rightCurrentPreview}
            className={cn(
              "p-3 rounded-full border border-dashed transition-all duration-200",
              leftCurrentPreview || rightCurrentPreview
                ? "border-primary text-primary hover:bg-primary hover:text-white cursor-pointer"
                : "border-gray-300 text-gray-400 cursor-not-allowed"
            )}
            title="交换图片位置"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
        </div>

        {/* 右侧上传区域 */}
        {renderUploadArea(
          rightLabel,
          rightIsDragOver,
          rightCurrentPreview,
          rightCurrentFile,
          rightUploadError,
          handleRightDragOver,
          handleRightDragLeave,
          handleRightDrop,
          handleRightClick,
          handleRightRemove,
          rightFileInputRef,
          handleRightFileSelect
        )}
      </div>
    </div>
  );
}
