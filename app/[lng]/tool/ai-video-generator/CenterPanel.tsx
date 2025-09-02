import { RecordProcessingType, TaskStep } from "@/types/generation";
import VideoCarousel from "@/components/VideoCarousel";

export default function CenterPanel({
  taskStep,
  taskData,
}: {
  taskStep: TaskStep;
  taskData: RecordProcessingType;
  generatedVideo: string | null;
}) {
  // 示例视频数据
  const sampleVideos = [
    {
      id: 1,
      src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-1.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-1.png",
    },
    {
      id: 2,
      src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-2.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-2.png",
    },
    {
      id: 3,
      src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-3.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-3.png",
    },
  ];

  // 如果正在处理任务，显示加载状态
  if (taskStep === "pollTaskStatus")
    return (
      <div className="w-full h-full flex items-center justify-center flex-col">
        {/* 旋转加载图标 */}
        <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
        {/* 加载文本 */}
        <p className="text-t-m text-xl">
          In the process of video generation, please wait for a moment...
        </p>
      </div>
    );

  // 如果有任务数据且有生成的视频，显示任务结果
  if (taskData?.urls && taskData?.urls.length > 0) {
    const videoUrl = taskData.urls[0];
    return (
      <div className="w-full h-full flex items-center justify-center  p-10  lg:p-12">
        <div className="w-full  bg-black aspect-[1250/893]">
          <video
            className="w-full   object-cover aspect-[1250/893]"
            controls={false}
            autoPlay={true}
            muted
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // 显示示例视频轮播
  return (
    <div className="w-full h-full flex items-center justify-center  p-10  lg:p-12">
      <VideoCarousel
        videos={sampleVideos}
        autoplayDelay={4000}
        showThumbnails={true}
        showIndicators={true}
        muted={true}
        controls={false}
        className="max-w-7xl"
      />
    </div>
  );
}
