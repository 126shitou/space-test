import Image from "next/image";
import LinkButton from "../LinkButton";
import VideoCarousel from "./VideoCarousel";
import { cn } from "@/lib/utils";
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

  const aivideoArr: VideoIntroduceItemProps[] = [
    {
      title: "Instantly create special effects videos from text",
      width: 1304,
      height: 961,
      paragraph:
        "Simply enter your idea and use our AI text-to-video generator to instantly bring it to life! No video editing experience is necessary. Powered by cutting-edge AI technology, our AI understands your words and transforms your text prompts into engaging HD videos. You can generate consistent characters, scenes, and objects throughout your AI video. Discover the magic of AI video generation today!",
      videoSrc:
        "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-introduce-1.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-introduce-1.png",
    },
    {
      title: "Exclusive AI Image Creation Features",
      width: 936,
      height: 529,
      paragraph:
        "AI Ease gives helpful tools to provide a better user experience: Random prompts and the Remix tool. For beginners, use our random prompt feature to get inspired and start the amazing journey to image generation. For skilled users,experiment and explore more possibilities of our powerful AI image generator. It means that you can reimagine a new image in a different art style with the same prompt and image aspect ratio.",
      videoSrc:
        "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-introduce-2.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-introduce-2.png",
    },
    {
      title: "Get Unlimited Image Sources",
      width: 1470,
      height: 1080,
      paragraph:
        "Designers, social media influencers, and marketing experts can use text prompts to generate faces, characters, landscapes, products, and any beautiful visuals of different styles in AI Ease. Use our AI image generator to create your one-of-a-kind images to use, sell, or post without worrying about the image source.",
      videoSrc:
        "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-introduce-3.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-introduce-3.png",
    },
    {
      title: "Visualize Prompts to Product Design Ideas",
      width: 1080,
      height: 1080,
      paragraph:
        "For the e-commerce team, our AI generator is the one-click wonder to turn your ideas into a draft without using complicated software, especially when working with a pile of tasks. Sketch out the product shape, color, materials, backgrounds,lighting, and display view, and see it become your first draft in seconds, and discuss where to polish with your team, saving a significant amount of time and speeding up workflow.",
      videoSrc:
        "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-introduce-4.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-introduce-4.png",
    },
    {
      title: "Create Your Own AI Photoshoot Studio",
      width: 362,
      height: 360,
      paragraph:
        "Upload your model image, and use our image reference tool to create more photoshoots without repaying the high cost for the models, studios, and any equipment. For individual content creators and small teams, AI Ease is a cheaper solution with stunning effects.",
      videoSrc:
        "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-introduce-5.mp4",
      poster:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-introduce-5.png",
    },
  ];

  const VideoStyleStepArr = [
    {
      id: 1,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-howtodo-1.png",

      paragraph:
        "Add optional reference images to ensure the AI perfectly matches your desired video scene.",
      title: "Step 1: Upload an image",
    },
    {
      id: 2,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-howtodo-2.png",
      paragraph:
        "Create creative descriptions of your images and take advantage of a variety of predefined art styles, camera movements, lighting effects, and aspect ratios to fully customize your AI videos.",
      title: "Step 2: Creative Description",
    },
    {
      id: 3,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-howtodo-3.png",
      paragraph:
        "Download your AI-generated video, or continue experimenting with tips to create new variations with new details and effects.",
      title: "Step 3: Generate and Download",
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
      <section className="w-full h-full">
        <div className="relative overflow-hidden aspect-[105/44] mx-2 sm:mx-4 lg:mx-5 my-2 sm:my-4 lg:my-5 rounded-lg sm:rounded-xl lg:rounded-2xl">
          {/* 背景视频 */}
          <video
            className="absolute top-0 left-0 w-full h-full z-0  object-cover"
            autoPlay
            muted
            width={105}
            height={44}
            poster="https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-hero.png"
            loop
            playsInline
          >
            <source
              src="https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-hero.mp4"
              type="video/mp4"
            />
          </video>
          {/* 内容层 */}
          <div className="absolute z-10 w-full h-full flex items-end justify-start px-3 sm:px-8 lg:px-15 py-4 sm:py-12 lg:pb-20">
            <div className="text-left w-full max-w-[280px] sm:max-w-lg lg:max-w-2xl">
              <hgroup className="mb-3 sm:mb-6">
                <h1 className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-5xl font-bold leading-tight mb-1 sm:mb-3 lg:mb-4">
                  <span className="block sm:inline">Free Online AI Video</span>
                  <br className="hidden sm:block" />
                  <span className="block sm:inline">Generator</span>
                </h1>
                <p className="text-white text-xs   lg:text-lg font-normal   mb-3 sm:mb-5 lg:mb-6">
                  Use AI Ease&apos;s online text to video AI generator and
                  quickly get fantastic videos with a few simple clicks. Type it
                  down, choose a style, and see your dream vision come alive in
                  seconds to use, share, or even sell.
                </p>
              </hgroup>
              <div className="w-full flex justify-start">
                <LinkButton
                  GTMName="ai-video-generator-starter"
                  path="/tool/ai-video-generator"
                  isHero
                  name="Get Started"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
          Exploring the possibilities of AI video generation
        </h2>
        <VideoCarousel
          videos={[
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
            {
              id: 4,
              src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-4.mp4",
              poster:
                "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-4.png",
            },
            {
              id: 5,
              src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-5.mp4",
              poster:
                "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-5.png",
            },
          ]}
          className="px-4"
        />
      </section>

      <section className="pt-20">
        {aivideoArr.map((item: VideoIntroduceItemProps, index: number) => (
          <VideoIntroduceItem
            key={index}
            title={item.title}
            paragraph={item.paragraph}
            videoSrc={item.videoSrc}
            index={index}
            poster={item.poster}
            width={item.width}
            height={item.height}
          />
        ))}
      </section>

      <section className="bg-[url('/ai-video-generator/a.svg')] bg-no-repeat bg-cover overflow-hidden w-full pt-20 pb-20">
        <div className="max-w-7xl mx-auto w-full px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
            How to Generate AI Video
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
            {VideoStyleStepArr.map((item, index) => (
              <div className="w-full md:w-1/3" key={index}>
                <Image
                  src={item.img}
                  alt={`${item.title} - AI image generation step ${index + 1}`}
                  width={428}
                  height={286}
                  className="aspect-[428/286] w-full"
                />
                <h3 className="py-3 text-lg md:text-xl font-bold text-center md:text-left">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-center md:text-left">
                  {item.paragraph}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mb-10">
            <LinkButton
              GTMName="ai-hairstyle-generator-howTo"
              path="/tool/ai-hairstyle-generator"
              name="Get Started"
            />
          </div>
        </div>
      </section>

      <FAQ GTMName="ai-cartoon-generator-faq" />
    </div>
  );
}

interface VideoIntroduceItemProps {
  title: string;
  paragraph: string;
  videoSrc: string;
  index?: number;
  poster?: string;
  width?: number;
  height?: number;
}
function VideoIntroduceItem({
  title,
  paragraph,
  videoSrc,
  index,
  poster,
  width,
  height,
}: VideoIntroduceItemProps) {
  const isEven = index! % 2 === 0;
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 justify-between items-start w-full mb-16 lg:mb-20 px-4",
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      )}
    >
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
        <div
          className={`w-full max-w-md md:max-w-lg lg:max-w-full overflow-hidden rounded-lg mb-4 object-cover`}
        >
          <video
            className="w-full rounded-lg object-cover"
            style={{ aspectRatio: `${width}/${height}` }}
            autoPlay
            width={width}
            height={height}
            muted
            loop
            playsInline
            poster={poster}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="w-full lg:w-1/2 text-center lg:text-left">
        <hgroup>
          <h2 className="text-neutral-800 text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-4">
            {title}
          </h2>
          <p className="text-neutral-800 text-sm md:text-base lg:text-lg font-normal leading-relaxed mb-6">
            {paragraph}
          </p>
        </hgroup>
        <LinkButton
          GTMName={`ai-cartoon-generator-example-${index}`}
          path="/tool/ai-cartoon-generator"
          name="Get Started"
        />
      </div>
    </div>
  );
}
