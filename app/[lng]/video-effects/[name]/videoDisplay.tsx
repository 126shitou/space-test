import { RecordProcessingType, TaskStep } from "@/types/generation";
import VideoCarousel from "@/components/VideoCarousel";

export default function VideoDisplay({
  taskStep,
  taskData,
  selectedEffect,
}: {
  taskStep: TaskStep;
  taskData: RecordProcessingType;
  selectedEffect: any;
}) {
  // 如果正在处理任务，不显示轮播图
  if (taskStep === "pollTaskStatus")
    return (
      <div className="w-full h-full flex items-center justify-center flex-col p-4">
        {/* 旋转加载图标 - 响应式大小 */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4 sm:mb-6 lg:mb-8"></div>
        {/* 加载文本 - 响应式字体大小 */}
        <p className="text-t-m text-sm sm:text-base lg:text-xl text-center px-4">
          In the process of video generation, please wait for a moment...
        </p>
      </div>
    );

  // 如果有任务数据且有生成的视频，不显示轮播图
  if (taskData?.urls && taskData?.urls.length == 1)
    return (
      <div className="h-full flex justify-center items-center aspect-video p-2 sm:p-3 lg:p-4">
        <video
          className="w-full h-full object-cover rounded-lg sm:rounded-xl"
          controls
          autoPlay
          muted
          loop
          playsInline // 移动端内联播放
        >
          <source src={taskData.urls[0]} type="video/mp4" />
        </video>
      </div>
    );

  if (taskData?.urls && taskData?.urls.length > 1)
    return (
      <div className="w-full h-full flex justify-center items-center  p-10  lg:p-12">
        <VideoCarousel
          videos={taskData?.urls.map((url) => ({ src: url }))}
          autoplayDelay={4000}
          showThumbnails={true}
          showIndicators={true}
          muted={true}
          controls={false}
          className={selectedEffect.style}
        />
      </div>
    );

  return (
    <div className="w-full h-full flex justify-center items-center  p-10  lg:p-12">
      <VideoCarousel
        videos={selectedEffect.videos}
        autoplayDelay={4000}
        showThumbnails={true}
        showIndicators={true}
        muted={true}
        controls={false}
        className="w-full"
      />
    </div>
  );
}
