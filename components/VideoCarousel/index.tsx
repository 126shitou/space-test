import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// 视频数据接口
interface VideoData {
  src: string; // 视频URL
  poster?: string; // 视频封面图
  title?: string; // 视频标题
}

// 组件属性接口
interface VideoCarouselProps {
  videos: VideoData[]; // 视频数据数组
  autoplayDelay?: number; // 自动播放间隔，默认5000ms
  className?: string; // 自定义样式类名
  aspectRatio?: string; // 视频宽高比，默认16/9
  showThumbnails?: boolean; // 是否显示缩略图，默认true
  showIndicators?: boolean; // 是否显示指示器，默认true
  autoPlay?: boolean; // 视频是否自动播放，默认true
  muted?: boolean; // 视频是否静音，默认true
  controls?: boolean; // 是否显示视频控制条，默认true
}

export default function VideoCarousel({
  videos,
  autoplayDelay = 5000,
  className = "",
  aspectRatio = "16/9",
  showThumbnails = true,
  showIndicators = true,
  autoPlay = true,
  muted = true,
  controls = true,
}: VideoCarouselProps) {
  // 轮播图API引用
  const [api, setApi] = useState<CarouselApi>();
  // 当前选中的视频索引
  const [current, setCurrent] = useState(0);
  // 视频播放状态
  const [isPlaying, setIsPlaying] = useState<boolean[]>(
    new Array(videos.length).fill(false)
  );

  // 如果没有视频，返回空
  if (!videos || videos.length === 0) {
    return null;
  }

  // 创建自动播放插件实例
  const autoplayPlugin = Autoplay({
    delay: autoplayDelay,
    stopOnInteraction: true, // 用户交互时停止
    stopOnMouseEnter: true, // 鼠标悬停时停止
    stopOnFocusIn: true, // 获得焦点时停止
  });

  // 处理轮播图API设置
  const handleApiChange = (carouselApi: CarouselApi) => {
    setApi(carouselApi);

    if (carouselApi) {
      setCurrent(carouselApi.selectedScrollSnap());

      // 监听选择变化
      carouselApi.on("select", () => {
        const newCurrent = carouselApi.selectedScrollSnap();
        setCurrent(newCurrent);

        // 切换视频时暂停所有其他视频
        setIsPlaying((prev) =>
          prev.map((_, index) => (index === newCurrent ? prev[index] : false))
        );
      });
    }
  };

  // 点击缩略图或指示器切换到对应视频
  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  // 处理视频播放/暂停
  const handleVideoPlayPause = (
    index: number,
    videoElement: HTMLVideoElement
  ) => {
    const newPlayingState = [...isPlaying];

    if (videoElement.paused) {
      videoElement.play();
      newPlayingState[index] = true;
    } else {
      videoElement.pause();
      newPlayingState[index] = false;
    }

    setIsPlaying(newPlayingState);
  };

  return (
    <div
      className={cn(
        "w-full max-w-6xl mx-auto p-2 sm:p-4 lg:p-6 h-full flex flex-col justify-center ",
        className
      )}
    >
      {/* 主轮播图 */}
      <div className="">
        <Carousel
          setApi={handleApiChange}
          className="w-full"
          plugins={[autoplayPlugin]} // 使用自动播放插件
          opts={{
            align: "start",
            loop: true, // 启用循环滚动
          }}
        >
          <CarouselContent>
            {videos.map((video, index) => (
              <CarouselItem key={index}>
                <div
                  className="relative w-full overflow-hidden rounded-lg bg-black "
                  style={{ aspectRatio: aspectRatio }}
                >
                  <video
                    className="w-full h-full transition-transform duration-300  object-cover"
                    autoPlay={autoPlay}
                    muted={muted}
                    controls={controls}
                    loop
                    playsInline
                    poster={video.poster}
                    onClick={(e) =>
                      handleVideoPlayPause(index, e.currentTarget)
                    }
                    onPlay={() => {
                      const newPlayingState = [...isPlaying];
                      newPlayingState[index] = true;
                      setIsPlaying(newPlayingState);
                    }}
                    onPause={() => {
                      const newPlayingState = [...isPlaying];
                      newPlayingState[index] = false;
                      setIsPlaying(newPlayingState);
                    }}
                  >
                    <source src={video.src} type="video/mp4" />
                    您的浏览器不支持视频播放。
                  </video>

                  {/* 视频标题覆盖层 */}
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white text-lg font-semibold">
                        {video.title}
                      </h3>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* 左右箭头 */}
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* 指示器 - 移动端优化触摸区域 */}
        {showIndicators && (
          <div className="flex justify-center mt-3 lg:mt-4 space-x-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "w-4 h-4 sm:w-3 sm:h-3 lg:w-3 lg:h-3 rounded-full transition-all duration-200 cursor-pointer touch-manipulation min-w-[16px] min-h-[16px] sm:min-w-[12px] sm:min-h-[12px]",
                  current === index
                    ? "bg-primary scale-110"
                    : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                )}
                aria-label={`切换到第 ${index + 1} 个视频`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 缩略图展示 - 移动端响应式优化 */}
      {showThumbnails && (
        <div className="mt-4 lg:mt-6">
          <div className="gap-1 sm:gap-2 flex justify-center flex-wrap">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative overflow-hidden rounded-md border-2 transition-all duration-200 cursor-pointer touch-manipulation",
                  "w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 xl:w-[150px] xl:h-[84px]",
                  current === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-primary/50 active:border-primary/70"
                )}
              >
                <div className="relative w-full h-full">
                  <video
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    poster={video.poster}
                  >
                    <source src={video.src} type="video/mp4" />
                  </video>
                </div>

                {/* 选中状态覆盖层 */}
                {current === index && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center cursor-pointer">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 视频标题 */}
                {video.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                    <p className="text-white text-xs truncate">{video.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
