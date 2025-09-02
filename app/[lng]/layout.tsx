import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { languages } from "../../i18n/config";
import { UserProvider } from "@/lib/contexts/user-context";
import { LoginDialogProvider } from "@/lib/contexts/login-dialog-context";
import Header from "@/components/Header";
import { getUserInfo } from "@/service/user";
import { customLog } from "@/lib/utils";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import {
  SITE_CONFIG,
  ROBOTS_CONFIG,
  getOpenGraphLocale,
  generateLanguageAlternates,
  generateCanonicalUrl,
  STRUCTURED_DATA_BASE,
} from "@/lib/config/seo";
import { Inter } from "next/font/google";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // 字体加载优化
  fallback: ["system-ui", "arial"], // Inter Fallback
});

// 动态生成元数据信息 - Next.js页面元数据配置
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lng: string }>;
}): Promise<Metadata> {
  const { lng } = await params;

  return {
    // 页面标题配置
    title: {
      template: `%s | ${SITE_CONFIG.name} - Free AI Image Generator`, // 子页面标题模板，%s会被替换为具体页面标题
      default: `${SITE_CONFIG.name} - Free Online AI Image Generator | Text to Image`, // 默认标题，用于首页或未设置标题的页面
    },
    // 页面描述，用于搜索引擎结果摘要和社交媒体分享
    description: SITE_CONFIG.description,
    // SEO关键词数组，帮助搜索引擎理解页面内容
    keywords: [
      "AI image generator",
      "text to image",
      "AI art",
      "free AI tools",
      "image creation",
    ],
    // 作者信息数组，可以有多个作者
    authors: SITE_CONFIG.authors,
    // 内容创建者，通常是个人或组织名称
    creator: SITE_CONFIG.creator,
    // 内容发布者，通常是公司或组织名称
    publisher: SITE_CONFIG.publisher,
    // 搜索引擎爬虫指令配置
    robots: ROBOTS_CONFIG,
    // 网站图标配置 - 解决favicon显示问题
    icons: {
      icon: "/favicon.ico?v=1", // 主图标，添加版本参数强制更新缓存
      shortcut: "/favicon.ico?v=1", // 快捷方式图标
      apple: "/favicon.ico?v=1", // Apple设备图标
    },
    // Open Graph协议配置，用于社交媒体分享（Facebook、LinkedIn等）
    openGraph: {
      type: "website", // 内容类型：网站
      locale: getOpenGraphLocale(lng), // 动态语言区域设置
      url: generateCanonicalUrl(lng), // 动态页面URL
      title: `${SITE_CONFIG.name} - Free Online AI Image Generator`, // OG标题
      description: SITE_CONFIG.description, // OG描述
      siteName: SITE_CONFIG.name, // 网站名称
      // OG图片配置数组
      // images: [
      //   {
      //     url: "/og-image.jpg", // 图片URL
      //     width: 1200, // 图片宽度（推荐1200px）
      //     height: 630, // 图片高度（推荐630px，比例1.91:1）
      //     alt: "AI Ease - AI Image Generator", // 图片替代文本
      //   },
      // ],
    },
    // Twitter卡片配置，用于Twitter分享
    // twitter: {
    //   card: "summary_large_image", // 卡片类型：大图摘要
    //   title: "AI Ease - Free Online AI Image Generator", // Twitter标题
    //   description: "Create stunning AI images from text prompts with AI Ease.", // Twitter描述
    //   images: ["/twitter-image.jpg"], // Twitter图片数组
    //   creator: "@aiease", // Twitter创建者账号
    // },
    // 多语言和规范链接配置
    alternates: {
      canonical: generateCanonicalUrl(lng), // 规范链接，指向当前语言版本
      // 多语言版本映射
      languages: generateLanguageAlternates(),
    },
    // 搜索引擎验证码配置
    // verification: {
    //   google: "your-google-verification-code", // Google Search Console验证码
    //   yandex: "your-yandex-verification-code", // Yandex验证码
    //   yahoo: "your-yahoo-verification-code", // Yahoo验证码
    // },
  };
}

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default async function LngLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await params;

  console.time("Layout Get User Time");
  const res = await getUserInfo();
  console.timeEnd("Layout Get User Time");
  const initUser = res.success ? res.data : null;

  customLog(
    "Layout Get User Success",
    `User Info: ${JSON.stringify(initUser)}`
  );

  // 结构化数据定义
  const structuredData = STRUCTURED_DATA_BASE;

  return (
    <html lang={lng}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />

        {/* 结构化数据 用于SEO优化 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <GoogleTagManager gtmId="GTM-NLRTJL6F" />
      <body
        className={`antialiased ${inter.variable}`}
      // className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.variable}`}
      >
        <UserProvider initUser={initUser}>
          <LoginDialogProvider>
            <Header />
            <div className="min-h-[calc(100vh-var(--height-header))]">
              {children}
            </div>
            <Footer />
          </LoginDialogProvider>
        </UserProvider>
        <Toaster />
      </body>
      <GoogleAnalytics gaId="G-XX9VBD5HCD" />
    </html>
  );
}
