import type { MetadataRoute } from "next";

/**
 * Robots.txt 配置
 * 用于指导搜索引擎爬虫如何抓取网站内容
 * 提升SEO效果，保护敏感路径
 */
export default function robots(): MetadataRoute.Robots {
  // 根据环境设置基础URL
  const baseUrl = process.env.SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "",
      },
      // {
      //   // 允许所有搜索引擎访问
      //   userAgent: "*",
      //   // 允许访问的路径
      //   allow: [
      //     "/", // 首页
      //     "/en/", // 英文版本
      //     "/zhCN/", // 简体中文版本
      //     "/zhTW/", // 繁体中文版本
      //     "/ar/", // 阿拉伯语版本
      //     "/de/", // 德语版本
      //     "/es/", // 西班牙语版本
      //     "/fr/", // 法语版本
      //     "/hi/", // 印地语版本
      //     "/it/", // 意大利语版本
      //     "/ja/", // 日语版本
      //     "/ko/", // 韩语版本
      //     "/ru/", // 俄语版本
      //     "/public/", // 静态资源
      //   ],
      //   // 禁止访问的路径
      //   disallow: [
      //     "/api/", // API接口
      //     "/api/*", // 所有API路由
      //     "/_next/", // Next.js内部文件
      //     "/admin/", // 管理后台（如果有）
      //     // "/*?*", // 带查询参数的URL
      //     "/*/tool/private", // 私有工具页面（如果有）
      //     "/auth/", // 认证相关页面
      //     "/user/", // 用户私人页面
      //   ],
      //   // 爬取延迟（秒）- 避免对服务器造成过大压力
      //   crawlDelay: 0.3,
      // },
      // {
      //   // 针对Google搜索引擎的特殊配置
      //   userAgent: "Googlebot",
      //   allow: [
      //     "/",
      //     "/*/", // 允许所有语言版本
      //     "/public/",
      //   ],
      //   disallow: ["/api/", "/_next/", "/auth/", "/user/", "/dashboard/"],
      //   // Google爬虫可以更频繁访问
      //   crawlDelay: 0.3,
      // },
      // {
      //   // 针对Bing搜索引擎的配置
      //   userAgent: "Bingbot",
      //   allow: ["/", "/*/", "/public/"],
      //   disallow: ["/api/", "/_next/", "/auth/", "/user/", "/dashboard/"],
      //   crawlDelay: 0.5,
      // },
    ],
    // 指向sitemap的URL
    sitemap: `${baseUrl}/sitemap.xml`,
    // 网站主机信息（可选）
    host: baseUrl,
  };
}
