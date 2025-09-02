"use client";
import TabFall from "@/components/TabFall";
import { useState } from "react";

export default function WaterfallTab() {
  const [showMore, setShowMore] = useState(false);
  const [height, setHeight] = useState("h-[1125px]");

  // 自定义tab配置 - 只显示瀑布流相关的标签
  const customTabs = [
    { value: "all", label: "All" },
    { value: "grid", label: "New" },
    { value: "list", label: "Trending" },
  ];

  // 自定义数据加载器函数
  const customDataLoader = async (params: {
    limit: number;
    offset: number;
    type: string;
  }) => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 示例视频数据源
    const sampleVideos = [
      {
        poster:
          "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/3.png",
        video:
          "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/banner-1.mp4",
        aspect: "16/9",
      },
      {
        poster:
          "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/8.png",
        video:
          "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/banner-2.mp4",
        aspect: "34/25",
      },
      {
        poster:
          "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/1.png",
        video:
          "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/banner-3.mp4",
        aspect: "952/543",
      },
    ];

    // 生成数据项
    const items = Array.from({ length: params.limit }, (_, index) => {
      const actualIndex = params.offset + index;
      const videoData = sampleVideos[actualIndex % sampleVideos.length];
      return {
        id: actualIndex + 1,
        title: `视频瀑布流 ${actualIndex + 1}`,
        url: videoData.video,
        poster: videoData.poster,
        description: `这是第 ${
          actualIndex + 1
        } 个视频瀑布流项目，支持鼠标悬停播放预览。`,
        aspect: videoData.aspect,
      };
    });

    // 模拟总数据量限制，假设最多200条数据
    const totalItems = 200;
    const hasMore = params.offset + params.limit < totalItems;

    return {
      items,
      hasMore,
    };
  };

  const btnClick = () => {
    setHeight("h-auto");
    setShowMore(true);
  };

  return (
    <div className={` ${height} overflow-hidden relative mx-auto rounded-2xl`}>
      <TabFall
        tabs={customTabs}
        dataLoader={customDataLoader}
        maxColumnCount={4}
        columnGutter={16}
        itemsPerPage={16}
      />
      {/* 部分渐变蒙版遮罩 */}
      {!showMore && (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-end justify-center pb-8 z-10">
          <button
            className="bg-[url('/ColorBorder.svg')] bg-cover bg-center bg-no-repeat  w-40 h-14 text-white cursor-pointer "
            onClick={btnClick}
          >
            View All Effects
          </button>
        </div>
      )}
    </div>
  );
}
