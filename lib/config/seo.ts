/**
 * SEO配置文件
 * 包含网站的公共SEO信息和配置
 */

import { languages } from "@/i18n/config";

// 网站基本信息配置
export const SITE_CONFIG = {
  // 网站名称
  name: "AI Ease",
  // 网站域名
  domain: "https://aiease.ai",
  // 网站描述
  description:
    "Create stunning AI images from text prompts with AI Ease. Free online AI image generator with multiple styles, high quality output, and instant results. No signup required.",
  // 网站作者信息
  authors: [{ name: "AI Ease Team" }],
  // 内容创建者
  creator: "AI Ease",
  // 内容发布者
  publisher: "AI Ease",
  // 社交媒体账号
  social: {
    twitter: "@aiease",
  },
};

// 搜索引擎爬虫配置
export const ROBOTS_CONFIG = {
  index: true, // 允许搜索引擎索引
  follow: true, // 允许搜索引擎跟踪链接
  googleBot: {
    index: true, // 允许Google索引
    follow: true, // 允许Google跟踪链接
    "max-video-preview": -1, // 视频预览最大长度，-1表示无限制
    "max-image-preview": "large" as const, // 图片预览大小
    "max-snippet": -1, // 文本摘要最大长度，-1表示无限制
  },
} as const;

/**
 * 获取Open Graph locale格式
 * @param lng - 语言代码
 * @returns Open Graph标准的locale格式
 */
export function getOpenGraphLocale(lng: string): string {
  switch (lng) {
    case "zh-CN":
      return "zh_CN";
    case "zh-TW":
      return "zh_TW";
    default:
      return lng.replace("-", "_");
  }
}

/**
 * 生成多语言链接映射
 * @param basePath - 基础路径（不包含语言前缀）
 * @returns 多语言链接对象
 */
export function generateLanguageAlternates(basePath: string = "") {
  const alternates: Record<string, string> = {};

  // 使用i18n配置中的languages数组
  languages.forEach((lng) => {
    alternates[lng] = `${SITE_CONFIG.domain}/${lng}${basePath}`;
  });

  return alternates;
}

/**
 * 生成规范链接
 * @param lng - 当前语言
 * @param path - 页面路径
 * @returns 完整的规范链接URL
 */
export function generateCanonicalUrl(lng: string, path: string = ""): string {
  return `${SITE_CONFIG.domain}/${lng}${path}`;
}

// 结构化数据基础配置 - 用于SEO优化的Schema.org标记
export const STRUCTURED_DATA_BASE = {
  // Schema.org上下文声明，告诉搜索引擎使用Schema.org词汇表
  "@context": "https://schema.org",
  // 定义为Web应用程序类型，适用于在线工具和服务
  "@type": "WebApplication",
  // 应用程序名称，从站点配置中获取
  name: SITE_CONFIG.name,
  // 应用程序描述，从站点配置中获取
  description: SITE_CONFIG.description,
  // 应用程序的URL地址，从站点配置中获取
  url: SITE_CONFIG.domain,
  // 应用程序分类为多媒体应用，适合AI图像生成器
  applicationCategory: "MultimediaApplication",
  // 支持的操作系统，设置为任意系统（跨平台Web应用）
  operatingSystem: "Any",
  // 产品报价信息，用于描述定价模式
  offers: {
    // 报价类型，使用Schema.org的Offer类型
    "@type": "Offer",
    // 价格设置为0，表示免费服务
    price: "0",
    // 价格货币单位为美元
    priceCurrency: "USD",
  },
  // 创建者信息，描述开发此应用的组织
  creator: {
    // 创建者类型为组织
    "@type": "Organization",
    // 组织名称，从站点配置中获取
    name: SITE_CONFIG.creator,
  },
} as const;

// // 验证码配置（可选）
// export const VERIFICATION_CONFIG = {
//   // google: "your-google-verification-code",
//   // yandex: "your-yandex-verification-code",
//   // yahoo: "your-yahoo-verification-code",
// } as const;
