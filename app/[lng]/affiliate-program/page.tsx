import Image from "next/image";
import LinkButton from "@/app/[lng]/(product)/LinkButton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import FAQ from "@/components/FAQ";
import {
  SITE_CONFIG,
  ROBOTS_CONFIG,
  getOpenGraphLocale,
  generateLanguageAlternates,
  generateCanonicalUrl,
} from "@/lib/config/seo";
import { Metadata } from "next";
/**
 * SEO元数据配置函数
 * 为AI图像生成器页面动态生成SEO相关的元数据
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
    "Free AI Image Generator - Create Stunning Images from Text | AI Ease";

  // 页面描述 - 显示在搜索结果摘要中，影响点击率
  const description =
    "Generate high-quality AI images from text prompts for free. AI Ease offers the fastest and easiest online text-to-image AI generator with multiple styles, instant results, and commercial use rights.";

  // 关键词 - 帮助搜索引擎理解页面内容主题
  const keywords =
    "AI image generator, text to image, AI art generator, free AI images, online image creator, artificial intelligence art, AI picture generator, text to art, AI design tool, image generation";

  // 当前页面的完整URL - 用于canonical链接和社交分享
  const url = generateCanonicalUrl(lng, "/ai-image-generator");

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
      // 分享时显示的图片
      // images: [
      //   {
      //     url: `${SITE_CONFIG.domain}/ai-image-generator/image8.jpg`, // 主要分享图片
      //     width: 823,
      //     height: 627,
      //     alt: "AI Image Generator - Create stunning images from text prompts",
      //   },
      //   {
      //     url: `${SITE_CONFIG.domain}/ai-image-generator/image18.jpg`, // 备用分享图片
      //     width: 628,
      //     height: 489,
      //     alt: "AI generated images examples",
      //   },
      // ],
    },
    // Twitter卡片配置 - 用于Twitter分享
    // twitter: {
    //   card: "summary_large_image", // 使用大图卡片格式
    //   site: SITE_CONFIG.social.twitter, // 网站Twitter账号
    //   creator: SITE_CONFIG.social.twitter, // 内容创建者Twitter账号
    //   title, // Twitter分享标题
    //   description, // Twitter分享描述
    //   images: [`${SITE_CONFIG.domain}/ai-image-generator/image8.jpg`], // Twitter分享图片
    // },
    // 替代链接配置
    alternates: {
      canonical: url, // 规范链接，防止重复内容问题
      // 多语言版本链接映射 - 帮助搜索引擎理解不同语言版本的关系
      languages: generateLanguageAlternates("/ai-image-generator"),
    },
    // verification: {
    //   google: "your-google-verification-code",
    // },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  // 获取当前页面的语言参数
  const { lng } = await params;
  // 产品页特有的结构化数据 - 直接在组件中定义以简化代码结构
  const productStructuredData = {
    "@context": "https://schema.org", // Schema.org 上下文，定义结构化数据的词汇表
    "@type": "Product", // 数据类型：产品
    name: "AI Image Generator", // 产品名称
    description:
      "Generate high-quality AI images from text prompts for free. AI Ease offers the fastest and easiest online text-to-image AI generator with multiple styles, instant results, and commercial use rights.", // 产品描述
    url: generateCanonicalUrl(lng, "/ai-image-generator"), // 产品页面的规范URL
    brand: {
      "@type": "Brand", // 品牌类型
      name: "AI Ease", // 品牌名称
    },
    category: "AI Software", // 产品类别
    applicationCategory: "DesignApplication", // 应用程序类别：设计应用
    operatingSystem: "Web Browser", // 运行环境：网页浏览器
    offers: {
      "@type": "Offer", // 报价类型
      price: "0", // 价格：免费
      priceCurrency: "USD", // 货币单位：美元
      availability: "https://schema.org/InStock", // 可用性：有库存
      priceValidUntil: "2026-12-31", // 价格有效期至
    },
    // aggregateRating: {
    //   "@type": "AggregateRating", // 聚合评分类型
    //   ratingValue: "4.8", // 平均评分值
    //   reviewCount: "1250", // 评论总数
    //   bestRating: "5", // 最高评分
    //   worstRating: "1", // 最低评分
    // },
    featureList: [
      // 功能特性列表
      "Text to Image Generation", // 文本转图像生成
      "Multiple Art Styles", // 多种艺术风格
      "High Resolution Output", // 高分辨率输出
      "Commercial Use Rights", // 商业使用权
      "Instant Results", // 即时结果
      "Free to Use", // 免费使用
    ],
    screenshot: `${SITE_CONFIG.domain}/ai-image-generator/image8.jpg`, // 产品截图URL
    applicationSubCategory: "AI Image Generator", // 应用子类别：AI艺术生成器
    softwareVersion: "2.0", // 软件版本号
    datePublished: new Date().toISOString(), // 发布日期
    dateModified: new Date().toISOString(), // 最后修改日期
  };

  const affiliateProgramArr = [
    {
      title: "High Commission Rates",
      description:
        "Earn 50% per sale with unlimited potential,tracked by a 60-day cookie period.",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580316/f_auto%2Cc_limit/ai-affiliate-program-whyjoin-0.png",
    },
    {
      title: "Monitor Results",
      description: "Monitor your performance and optimize your campaigns.",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580316/f_auto%2Cc_limit/ai-affiliate-program-whyjoin-1.png",
    },
    {
      title: "Timely Payments",
      description:
        "Receive your earnings promptly and reliably with consistent on-time payments.",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580316/f_auto%2Cc_limit/ai-affiliate-program-whyjoin-2.png",
    },
    {
      title: "Dedicated Support",
      description:
        "Receive dedicated support and stunning resources to easily promote ImagineArt.",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580316/f_auto%2Cc_limit/ai-affiliate-program-whyjoin-3.png",
    },
  ];

  const affiliateProgramStepArr = [
    {
      title: "Step Up",
      paragraph:
        "Click Join Now to signup up and fill in the required details. Get instant access to your affiliate referral link and dashboard.",
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580080/f_auto%2Cc_limit/ai-affiliate-program-howto-1.png",
    },
    {
      title: "Promote",
      paragraph:
        "Promote Effects AI across your channels—website, social media, blogs, and more.",
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580080/f_auto%2Cc_limit/ai-affiliate-program-howto-2.png",
    },
    {
      title: "Earn Commissions",
      paragraph:
        "For every sale made through your links, you'll earn commissions.",
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755580080/f_auto%2Cc_limit/ai-affiliate-program-howto-3.png",
    },
  ];

  const affiliateProgramBenefits = [
    {
      title:
        "No matter which subscription plan your referral chooses, you'll earn upto 50% commission.",
    },
    {
      title:
        "You receive a commission for every sale made through your affiliate link.",
    },
    {
      title:
        "When your referred customer makes their first purchase, you instantly earn a commission",
    },
    {
      title:
        "Our Affiliate Team provides Newsletters with the latest updates on new promotion, product releases and more",
    },
  ];

  const affiliateProgramLookingArr = [
    {
      title: "Creative Professionals",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755581521/f_auto%2Cc_limit/ai-affiliate-program-Looking-0.png",
    },
    {
      title: "Marketers",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755581521/f_auto%2Cc_limit/ai-affiliate-program-Looking-1.png",
    },
    {
      title: "Bloggers",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755581521/f_auto%2Cc_limit/ai-affiliate-program-Looking-2.png",
    },
    {
      title: "Media Anchor",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755581521/f_auto%2Cc_limit/ai-affiliate-program-Looking-3.png",
    },
    {
      title: "Influencers",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755581521/f_auto%2Cc_limit/ai-affiliate-program-Looking-4.png",
    },
    {
      title: "Educators",
      icon: "https://res.cloudinary.com/dsciihnpa/image/upload/v1755581521/f_auto%2Cc_limit/ai-affiliate-program-Looking-5.png",
    },
  ];

  const affiliateProgramFAQ = [
    {
      id: 1,
      content: "How do I sign up for ImagineArt Affiliate Program?",
    },
    {
      id: 2,
      content: "What is ImagineArt Affiliate Program payment schedule?",
    },
    {
      id: 3,
      content: "What payment model does ImagineArt offer?",
    },
    {
      id: 4,
      content: "What does ImagineArt offer to their affiliates?",
    },
  ];

  return (
    <div className="w-full h-full relative">
      {/* 产品页特有的结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <section className="relative overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[105/44] mx-2 sm:mx-4 lg:mx-5 my-2 sm:my-4 lg:my-5 rounded-lg sm:rounded-xl lg:rounded-2xl">
        {/* 背景图片 */}
        <Image
          src="https://res.cloudinary.com/dsciihnpa/image/upload/v1755573783/f_auto%2Cc_limit/ai-affiliate-program-hero_gy0rle.png"
          alt="AI Affiliate Program Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center sm:items-end px-3 sm:px-8 lg:px-15 py-4 sm:py-12 lg:pb-20">
          <div className="max-w-[320px] sm:max-w-lg lg:max-w-2xl">
            <hgroup className="mb-4 sm:mb-6">
              <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-2 sm:mb-3 lg:mb-4">
                <span className="block sm:inline">Join Effects Affiliate</span>
                <br className="hidden sm:block" />
                <span className="block sm:inline">Program Now</span>
              </h1>
              <p className="text-white text-sm sm:text-base lg:text-lg leading-relaxed">
                Earn upto 50% commission on every sale with unlimited earning
                potential. Tap into the growing AI-driven art community and turn
                your influence into income.
              </p>
            </hgroup>
            <LinkButton
              GTMName="ai-video-generator-starter"
              path="/tool/ai-video-generator"
              isHero
              name="Join Now"
            />
          </div>
        </div>
      </section>

      <section className="pt-8 sm:pt-10 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Why Join Our Affiliate Program?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {affiliateProgramArr.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-25 lg:h-25 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed px-2 sm:px-0">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden w-full pt-12 sm:pt-20 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto w-full px-4">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-10">
            How to Get Started?
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-6 sm:gap-8 md:gap-4">
            {affiliateProgramStepArr.map((item, index) => (
              <div className="w-full md:w-1/3" key={index}>
                <Image
                  src={item.img}
                  alt={`${item.title} - AI image generation step ${index + 1}`}
                  width={428}
                  height={286}
                  className="aspect-[428/286] w-full rounded-lg"
                />
                <h3 className="text-center py-2 sm:py-3 text-base sm:text-lg md:text-xl font-bold">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-center px-2 sm:px-0 leading-relaxed">
                  {item.paragraph}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mb-8 sm:mb-10 mt-8 sm:mt-10">
            <Link
              href="/"
              className="inline-block px-8 sm:px-12 py-3 sm:py-4 border-2 border-purple-600 text-purple-600 rounded-full font-medium text-base sm:text-lg transition-colors duration-200 cursor-pointer text-center"
            >
              Join Now
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Benefits of the Effects Affiliate Program
          </h2>
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center">
            {/* Left side - Benefits list */}
            <div className="flex-1 lg:flex-[1.2] space-y-3 sm:space-y-4 max-h-[450px] overflow-hidden">
              {affiliateProgramBenefits.map((item, index) => (
                <div className="flex items-start space-x-3 mb-1" key={index}>
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed text-xs sm:text-[13px] font-semibold">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Right side - Image */}
            <div className="flex-1 lg:flex-[1] flex justify-center mt-4 lg:mt-0">
              <Image
                src="https://res.cloudinary.com/dsciihnpa/image/upload/v1755583678/f_auto%2Cc_limit/ai-affiliate-program-Benefits.png"
                alt="Benefits of the Effects Affiliate Program"
                width={580}
                height={450}
                className="w-full max-w-2xl rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 sm:pt-10 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Who We Are Looking For?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {affiliateProgramLookingArr.map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={300}
                    height={225}
                    className="w-full h-40 sm:h-48 md:h-full object-contain"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 pt-2 sm:pt-3 text-center md:text-left ">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pt-6 sm:pt-8 md:pt-10 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
            <Image
              src="https://res.cloudinary.com/dsciihnpa/image/upload/v1755582377/f_auto%2Cc_limit/ai-affiliate-program-Partner.png"
              alt="Become a Partner Background"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            />

            {/* 内容区域 */}
            <div className="absolute inset-0 flex flex-col justify-end items-center text-center text-white p-4 sm:p-6 md:p-8">
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                  Become a Partner & Earn a upto
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>
                  <span className="text-yellow-300">50% Commission</span> Per
                  Sale Now!
                </h2>
                <Link
                  href="/"
                  className="inline-block px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-pink-300 to-yellow-300 text-gray-800 rounded-full font-semibold text-sm sm:text-base md:text-lg border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQ GTMName="AiAffiliateProgram" />
    </div>
  );
}
