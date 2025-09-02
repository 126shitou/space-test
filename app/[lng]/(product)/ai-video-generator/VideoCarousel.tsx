"use client";

import React from "react";
import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
interface Video {
  id: number;
  src: string;
  poster: string;
}

interface VideoCarouselProps {
  videos: Video[];
  scrollSpeed?: number; // 滚动速度（像素/帧）
  showControls?: boolean; // 是否显示控制按钮
  className?: string;
}

export default function VideoCarousel({
  videos,
  scrollSpeed = 2,
  className = "",
}: VideoCarouselProps) {
  // 为了实现更流畅的无限滚动，复制视频数组
  const duplicatedVideos = [...videos, ...videos];

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true, // 允许自由拖拽
          containScroll: false, // 不限制滚动范围
        }}
        plugins={[
          AutoScroll({
            speed: scrollSpeed, // 自动滚动速度
            startDelay: 0, // 立即开始滚动
            direction: "forward", // 向前滚动
            playOnInit: true, // 初始化时开始播放
            stopOnInteraction: false, // 用户交互时不停止
            stopOnMouseEnter: true, // 鼠标悬停时暂停
            stopOnFocusIn: false, // 获得焦点时不停止
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {duplicatedVideos.map((video, index) => (
            <CarouselItem
              key={`${video.id}-${index}`}
              className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <video
                  className="w-full h-full object-cover"
                  poster={video.poster}
                  muted
                  playsInline
                >
                  <source src={video.src} type="video/mp4" />
                  您的浏览器不支持视频播放。
                </video>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
