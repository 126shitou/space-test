import AiImgGeneratorClient from "./client";
import { Metadata } from "next";
import {
  SITE_CONFIG,
  ROBOTS_CONFIG,
  getOpenGraphLocale,
  generateLanguageAlternates,
  generateCanonicalUrl,
} from "@/lib/config/seo";

/**
 * SEO元数据配置函数
 * 为AI图像生成工具页面动态生成SEO相关的元数据
 * @param params - 包含语言参数的Promise对象
 * @returns Promise<Metadata> - Next.js元数据对象
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  // 获取当前页面的语言参数
  const { lng } = await params;

  // 页面标题 - 显示在浏览器标签页和搜索结果中
  const title =
    "AI Image Generator Tool - Create Images from Text Online | AI Ease";

  // 页面描述 - 显示在搜索结果摘要中，影响点击率
  const description =
    "Use our powerful AI image generator tool to create stunning images from text prompts. Free online text-to-image converter with multiple styles, instant results, and high-quality output for all your creative needs.";

  // 关键词 - 帮助搜索引擎理解页面内容主题
  const keywords =
    "AI image generator tool, text to image converter, online AI art tool, free image generator, AI picture creator, text to art tool, image generation tool, AI design tool, artificial intelligence images";

  // 当前页面的完整URL - 用于canonical链接和社交分享
  const url = generateCanonicalUrl(lng, "/tool/ai-image-generator");

  return {
    // 页面标题
    title,
    // 页面描述
    description,
    // 页面关键词
    keywords,
    // 页面作者信息
    authors: SITE_CONFIG.authors,
    // 内容创建者
    creator: SITE_CONFIG.creator,
    // 内容发布者
    publisher: SITE_CONFIG.publisher,
    // 搜索引擎爬虫指令配置
    robots: ROBOTS_CONFIG,
    // Open Graph协议配置 - 用于Facebook、LinkedIn等社交平台分享
    openGraph: {
      type: "website", // 内容类型为网站
      // 根据语言参数设置locale
      locale: getOpenGraphLocale(lng),
      url, // 页面URL
      title, // 分享标题
      description, // 分享描述
      siteName: SITE_CONFIG.name, // 网站名称
    },
    // 替代链接配置
    alternates: {
      canonical: url, // 规范链接，防止重复内容问题
      // 多语言版本链接映射 - 帮助搜索引擎理解不同语言版本的关系
      languages: generateLanguageAlternates("/tool/ai-image-generator"),
    },
  };
}

export default function AiImgGeneratorPage() {
  return <AiImgGeneratorClient />;
}
