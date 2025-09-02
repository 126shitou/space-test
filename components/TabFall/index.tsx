"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Masonry } from "masonic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// 瀑布流项目数据类型
interface WaterfallItem {
  id: number;
  url: string;
  poster: string;
  description: string;
  aspect: string;
}

// 瀑布流卡片组件
const WaterfallCard = ({
  data,
  width,
}: {
  data: WaterfallItem;
  width?: number;
  [key: string]: any;
}) => {
  if (!data.aspect) return null;
  const height = width ? width / eval(data.aspect) : 200;
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <video
        src={data.url}
        poster={data.poster}
        className="w-full object-cover cursor-pointer"
        style={{ height: `${height}px` }}
        preload="metadata"
        onMouseEnter={(e) => {
          // 鼠标悬停时播放视频
          const video = e.target as HTMLVideoElement;
          video.play().catch(() => {});
        }}
        onMouseLeave={(e) => {
          // 鼠标离开时暂停视频
          const video = e.target as HTMLVideoElement;
          video.pause();
          video.currentTime = 0;
        }}
      />
    </div>
  );
};

// Tab配置接口
interface TabConfig {
  value: string;
  label: string;
}

// 数据加载器类型 - 简化为直接的函数类型
type DataLoader = (params: {
  limit: number;
  offset: number;
  type: string;
  signal?: AbortSignal;
}) => Promise<{
  items: WaterfallItem[];
  hasMore: boolean;
}>;

interface TabFallProps {
  // Tab配置
  tabs?: TabConfig[];
  // 数据加载器
  dataLoader?: DataLoader;
  // 瀑布流配置
  maxColumnCount?: number; // 列数量
  columnGutter?: number;
  itemsPerPage?: number;
}

export default function TabFall({
  tabs,
  dataLoader,
  maxColumnCount = 4, // 默认4列
  columnGutter = 16,
  itemsPerPage = 20,
}: TabFallProps) {
  // Tab相关状态
  const [activeTab, setActiveTab] = useState("all");

  // 瀑布流相关状态
  const [items, setItems] = useState<WaterfallItem[]>([]);  
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 使用传入的配置，如果没有传入则使用空配置
  const tabsConfig = tabs || [];

  // 清理函数：在组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // 加载更多数据
  const loadMoreItems = useCallback(async () => {
    console.log("return");

    // 取消之前的请求
    if (abortControllerRef.current || loading || !hasMore) {
      abortControllerRef.current?.abort();
    }

    // 创建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);

    try {
      let newItems: WaterfallItem[];

      // 使用数据加载函数
      if (dataLoader) {
        console.log("load more");
        const offset = (page - 1) * itemsPerPage;
        const result = await dataLoader({
          limit: itemsPerPage,
          offset,
          type: activeTab,
          signal: abortController.signal,
        });

        // 检查请求是否被取消
        if (abortController.signal.aborted) {
          return;
        }

        console.log("result", result);

        newItems = result.items;

        // 根据返回的hasMore字段更新状态
        if (!result.hasMore) {
          setHasMore(false);
        }
      } else {
        // 如果没有提供数据加载函数，返回空数组
        newItems = [];
        setHasMore(false);
      }

      setItems((prevItems) => [...prevItems, ...newItems]);
      setPage((prevPage) => prevPage + 1);

      // 检查是否还有更多数据 - 完全依赖服务端返回的hasMore状态
      // 如果返回的数据量少于请求量，说明已经没有更多数据了
      if (newItems.length < itemsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      // 忽略被取消的请求错误
      if (error instanceof Error && error.name === "AbortError") {
        console.log("请求被取消");
        return;
      }
      console.error("加载数据失败:", error);
    } finally {
      // 只有在当前请求没有被取消时才更新loading状态
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [loading, hasMore, page, itemsPerPage, dataLoader, activeTab]);

  // 使用Intersection Observer监听加载触发器
  useEffect(() => {
    // 获取哨兵元素（在渲染函数中创建）
    const sentinel = document.querySelector("[data-load-more-sentinel]");
    if (!sentinel) return;

    // 创建Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 当哨兵元素进入视口且满足加载条件时触发加载
          if (entry.isIntersecting && !loading && hasMore) {
            loadMoreItems();
          }
        });
      },
      {
        // 设置根边距，提前400px触发
        rootMargin: "0px 0px 400px 0px",
        threshold: 0,
      }
    );

    // 开始观察哨兵元素
    observer.observe(sentinel);

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore, loadMoreItems]);

  // 处理tab切换事件
  const handleTabChange = useCallback(
    (value: string) => {
      // 取消当前进行中的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // 更新activeTab
      setActiveTab(value);

      // 重置状态
      setItems([]);
      setPage(1);
      setHasMore(true);
      setLoading(false);
      console.log("activeTab change to:", value);

      // 重新加载数据
      loadMoreItems();
    },
    [loadMoreItems]
  );

  // 渲染瀑布流内容
  const renderWaterfallContent = () => {
    return (
      <div className="w-full">
        {items.length > 0 && (
          <Masonry
            items={items}
            columnGutter={columnGutter} // 列间距
            maxColumnCount={maxColumnCount}
            overscanBy={5} // 预渲染项目数量
            render={WaterfallCard} // 渲染组件
          />
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">加载中...</span>
          </div>
        )}

        {/* 没有更多数据提示 */}
        {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-gray-500">已加载全部内容</div>
        )}

        {/* 初始加载状态 */}
        {items.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">暂无数据</div>
        )}

        {/* Intersection Observer 哨兵元素 */}
        {hasMore && (
          <div
            data-load-more-sentinel
            className="h-1 w-full"
            style={{ visibility: "hidden" }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full  flex justify-center mb-8">
      <Tabs
        defaultValue={tabsConfig[0]?.value}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="bg-transparent p-0 h-auto">
          {tabsConfig.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="px-4 py-2 data-[state=active]:[&>span]:block data-[state=active]:text-black data-[state=active]:bg-transparent data-[state=active]:shadow-none   mb-6 cursor-pointer text-neutral-800  font-semibold leading-normal relative text-base lg:text-xl"
            >
              {item.label}
              <span className="absolute w-full bottom-0 left-0 h-1 bg-gradient-to-r from-violet-600 via-blue-600 via 27% to-pink-600 rounded-sm hidden" />
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>{renderWaterfallContent()}</TabsContent>
      </Tabs>
    </div>
  );
}
