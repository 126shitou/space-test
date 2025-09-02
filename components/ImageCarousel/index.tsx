import Image from "next/image";
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

// 组件属性接口
interface ImageCarouselProps {
  images: string[]; // 图片URL数组
  autoplayDelay?: number; // 自动播放间隔，默认3000ms
  className?: string; // 自定义样式类名
  aspectRatio?: string; // 图片宽高比，默认4/3
  showThumbnails?: boolean; // 是否显示缩略图，默认true
  showIndicators?: boolean; // 是否显示指示器，默认true
}

export default function ImageCarousel({
  images,
  autoplayDelay = 3000,
  className = "",
  aspectRatio = "4/3",
  showThumbnails = true,
  showIndicators = true,
}: ImageCarouselProps) {
  // 轮播图API引用
  const [api, setApi] = useState<CarouselApi>();
  // 当前选中的图片索引
  const [current, setCurrent] = useState(0);

  // 如果没有图片，返回空
  if (!images || images.length === 0) {
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
        setCurrent(carouselApi.selectedScrollSnap());
      });
    }
  };

  // 点击缩略图或指示器切换到对应图片
  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto p-2 sm:p-4 lg:p-6 h-full flex flex-col justify-center",
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
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div
                  className="relative w-full overflow-hidden rounded-lg"
                  style={{ aspectRatio: aspectRatio }}
                >
                  <Image
                    src={image}
                    alt={`轮播图 ${index + 1}`}
                    fill
                    className="object-contain transition-transform duration-300"
                    priority={index === 0} // 首张图片优先加载
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
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
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "w-4 h-4 sm:w-3 sm:h-3 lg:w-3 lg:h-3 rounded-full transition-all duration-200 cursor-pointer touch-manipulation min-w-[16px] min-h-[16px] sm:min-w-[12px] sm:min-h-[12px]",
                  current === index
                    ? "bg-primary scale-110"
                    : "bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
                )}
                aria-label={`切换到第 ${index + 1} 张图片`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 缩略图展示 - 移动端响应式优化 */}
      {showThumbnails && (
        <div className="mt-4 lg:mt-6">
          <div className="gap-1 sm:gap-2 flex justify-center flex-wrap">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative overflow-hidden rounded-md border-2 transition-all duration-200 cursor-pointer touch-manipulation",
                  "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:max-w-[150px]",
                  current === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-primary/50 active:border-primary/70"
                )}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-contain w-full h-full"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 150px"
                />

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
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
