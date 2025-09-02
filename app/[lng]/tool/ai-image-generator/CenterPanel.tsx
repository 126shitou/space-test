import { RecordProcessingType, TaskStep } from "@/types/generation";
import ImageCarousel from "@/components/ImageCarousel";

export default function CenterPanel({
  taskStep,
  taskData,
}: {
  taskStep: TaskStep;
  taskData: RecordProcessingType;
}) {
  // 示例图片数据
  const images = [
    "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-1_m86eth.png",
    "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-7_gbjed9.png",
    "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-3_jyanhl.png",
    "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-4_mrd7f4.png",
  ];

  console.log("taskData", JSON.stringify(taskData));

  // 如果正在处理任务，不显示轮播图
  if (taskStep === "pollTaskStatus")
    return (
      <div className="w-full h-full flex items-center justify-center flex-col p-4 sm:p-6 lg:p-8">
        {/* 旋转加载图标 - 移动端适配 */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-6 lg:mb-8"></div>
        {/* 加载文本 - 移动端优化 */}
        <p className="text-center text-base sm:text-lg lg:text-xl text-gray-700 px-4 leading-relaxed">
          In the process of image generation, please wait for a moment...
        </p>
      </div>
    );

  // 如果有任务数据且有生成的图片，不显示轮播图
  if (taskData?.urls && taskData?.urls.length > 0)
    return (
      <div className="w-full h-full p-10  lg:p-12">
        <ImageCarousel
          images={taskData.urls}
          autoplayDelay={3000}
          showThumbnails={true}
          showIndicators={true}
        />
      </div>
    );

  return (
    <div className="w-full h-full p-10  lg:p-12">
      <ImageCarousel
        images={images}
        autoplayDelay={3000}
        showThumbnails={true}
        showIndicators={true}
      />
    </div>
  );
}
