// 单个 sitemap 最多 50,000 个 URL
// 内容变化时更新 sitemap

/**
 * @loc: 页面的完整 URL（必需）
 * @lastmod: 页面最后修改时间（可选）
 */

/**
 * 帮助搜索引擎发现页面：特别是那些难以通过链接发现的页面
 * 提供页面元信息：如最后修改时间、更新频率、优先级等
 * 加速索引：帮助搜索引擎更快地发现和索引新内容
 * 提高 SEO 效果：确保重要页面被搜索引擎收录
 * xhtml:link 提供多语言版本的链接关系
 */

import { languages } from "@/i18n/config";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://www.hermesphoto.shop';
  const currentDate = new Date();

  const sitemaps: MetadataRoute.Sitemap = [];

  const urls = [
    {
      url: "/",
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
    },
    {
      url: "/ai-image-generator",
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
    },
    {
      url: "/tool/ai-image-generator",
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
    },
  ];

  // 添加主要页面（不使用alternates）
  urls.forEach((urlConfig) => {
    sitemaps.push({
      url: `${baseUrl}${urlConfig.url}`,
      lastModified: urlConfig.lastModified,
      changeFrequency: urlConfig.changeFrequency,
    });
  });

  // 为每种语言创建单独的URL条目
  languages.forEach((lang) => {
    urls.forEach((urlConfig) => {
      sitemaps.push({
        url: `${baseUrl}/${lang}${urlConfig.url}`,
        lastModified: urlConfig.lastModified,
        changeFrequency: urlConfig.changeFrequency,
      });
    });
  });

  console.log("Generated simplified sitemap:", sitemaps.length, "URLs");
  return sitemaps;
}
