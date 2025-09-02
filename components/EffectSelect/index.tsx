"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronRight, Search } from "lucide-react";

type EffectData = {
  id: string;
  title: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
};

// 组件Props接口
interface EffectSelectProps {
  effects: EffectData[];
  selectedEffect: EffectData;
  onEffectSelect?: (effect: EffectData) => void;
  itemRender?: (item: EffectData) => React.ReactElement;
}

// 详细效果卡片组件
function DetailedEffectCard({ item }: { item: EffectData }) {
  // 处理视频hover播放
  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.play().catch(() => {
      // 忽略播放失败的错误
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0; // 重置到开始位置
  };

  return (
    <div className="group cursor-pointer rounded-lg overflow-hidden bg-b-p transition-all duration-200   flex flex-col h-full justify-center">
      <div className="aspect-video relative overflow-hidden">
        <video
          loop
          muted
          className="w-full h-full object-cover"
          src={item.videoUrl || ""}
          poster={item.imageUrl || ""}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      <div className="p-3 bg-b-s flex-1 flex justify-center items-center">
        <h4 className="text-t-p text-sm font-medium text-center  ">
          {item.title}
        </h4>
      </div>
    </div>
  );
}

export default function EffectSelect({
  effects,
  selectedEffect,
  itemRender,
  onEffectSelect,
}: EffectSelectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDetailedEffectClick = (effect: EffectData) => {
    onEffectSelect?.(effect);
    setIsDialogOpen(false);
  };

  // 过滤效果数据
  const filteredEffects = effects.filter((effect) =>
    effect.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-b-p text-t-p">
      {/* Dialog包装整个弹窗逻辑 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* 触发器 - 这个div点击后会打开弹窗 */}
        <DialogTrigger asChild>
          <div className="group flex h-16 cursor-pointer items-center justify-between gap-2 rounded-lg p-2 text-sm bg-b-s">
            <div className="flex w-full h-full items-center gap-2 ">
              <Image
                decoding="async"
                src={selectedEffect?.imageUrl || ""}
                loading="eager"
                className="h-full w-auto rounded-lg object-cover"
                width={85}
                height={65}
                alt="effect"
              />
              <span className="text-t-p text-sm">
                {selectedEffect?.title || "选择效果"}
              </span>
            </div>
            <span className="text-t-s group-hover:text-t-p transition-colors">
              <ChevronRight />
            </span>
          </div>
        </DialogTrigger>

        {/* 弹窗内容 */}
        <DialogContent className="max-w-6xl w-[90vw]   bg-b-p border-bd-p text-t-p flex flex-col">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-t-p">选择一个效果</DialogTitle>

            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4  text-t-s" />
              <input
                type="text"
                placeholder="搜索效果名称、类型或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-b-p border border-bd-p rounded-lg text-t-p placeholder-t-s focus:outline-none focus:ring-2 focus:ring-[var(--text-t-p)] focus:border-transparent transition-all"
              />
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {filteredEffects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                {filteredEffects.map((effect) => (
                  <div
                    key={effect.id}
                    onClick={() => handleDetailedEffectClick(effect)}
                    className="w-full  "
                  >
                    {itemRender ? (
                      itemRender(effect)
                    ) : (
                      <DetailedEffectCard item={effect} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32  text-t-s">
                <Search className="w-12 h-12 mb-2 opacity-50" />
                <p>未找到匹配的效果</p>
                {searchQuery && (
                  <p className="text-sm mt-1">
                    尝试搜索: &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
