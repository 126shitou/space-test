// 添加静态生成配置
// export const dynamic = "force-static";
// export const revalidate = 86400; // 24小时重新验证

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

  const ImageIntroduces: ImageIntroduceItemProps[] = [
    {
      title: "Generate AI Images from Text Prompts",
      width: 692,
      height: 539,

      paragraph:
        "Without any extra complicated skills, AI Ease offers the easiest and fastest image creator to convert your text idea into vibrant and delicate AI images in mere seconds. Our AI understands, generatively fills, and outputs the image with consistent subjects, objects, and backgrounds, even if you write the simplest prompt like “A panda”. Ease yourself, and confidently try our online text to image AI tool to create artistic AI images now!",
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-introduce-1_fsmtdk.png",
    },
    {
      title: "Improve Consistency with Image Reference",
      width: 718,
      height: 415,

      paragraph:
        "Generate AI images with the face and content from your input images to get more satisfying results when using AI Ease’s online image-to-image AI generator. Our tool can learn, imitate, and output similar AI photos by adjusting the intensity of the reference strength. The higher the intensity is, the more similar the results will be when creating consistent visuals in our AI picture ener tor.",
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-introduce-2_pftu3d.png",
    },
    {
      title: "Stable Style Control Ability",
      width: 692,
      height: 423,
      paragraph:
        "AI Ease has pre-trained a wide list of styles covering realistic, futuristic,traditional, and trending art styles. All these styles are perfect for all input text prompts to define the image with unprecedented stability. With such stable control over style, easily generate your consistent story illustrations or comics with ease by using our online AI art generator. Our team is continuously updating our art templates with fancier, stylish, and playful styles.",
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-introduce-3_pktzzn.png",
    },
    {
      title: "Exclusive AI Image Creation Features",
      width: 744,
      height: 569,
      paragraph:
        "AI Ease gives helpful tools to provide a better user experience: Random prompts and the Remix tool. For beginners, use our random prompt feature to get inspired and start the amazing journey to image generation. For skilled users,experiment and explore more possibilities of our powerful AI image generator. It means that you can reimagine a new image in a different art style with the same prompt and image aspect ratio.",
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-introduce-4_d4pkak.png",
    },
    {
      title: "Get Unlimited Image Sources",
      width: 708,
      height: 593,
      paragraph:
        "Designers, social media influencers, and marketing experts can use text prompts to generate faces, characters, landscapes, products, and any beautiful visuals of different styles in AI Ease. Use our AI image generator to create your one-of-a-kind images to use, sell, or post without worrying about the image source.",
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-introduce-5_zoh3ls.png",
    },
  ];

  const AIHairStyleStepArr = [
    {
      id: 1,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-howtodo-1_ud2vfx.png",
      with: 480,
      height: 325,
      paragraph:
        "Write your text prompts for AI image generations inour text box. The more detailed your prompts are,the more delicate the output will be.",
      title: "Step 1: Enter Text Prompts",
    },
    {
      id: 2,
      with: 480,
      height: 325,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-howtodo-2_j8twmv.png",
      paragraph:
        "Pick your preferred AI generation style in our stylelibrary, and then choose the number and aspect ratioof AI generated images.",
      title: "Step 2: Choose Styles and Settings",
    },
    {
      id: 3,
      with: 480,
      height: 325,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-howtodo-3_z2ahhf.png",
      paragraph:
        "Once ready, click the “Generate” button, and our toolwill output your AI images in seconds. Download andshare it when satisfied.",
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
      <section className="relative w-full bg-[url('/a.svg')] bg-no-repeat bg-cover overflow-hidden pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-14 w-full"></div>

          <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 justify-center items-center mb-10 lg:mb-20">
            <div className="text-center lg:text-left lg:flex-1">
              <hgroup>
                <h1 className="h-auto justify-center text-neutral-800 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight lg:leading-[56px] max-w-full">
                  Free Online AI Image
                  <br className="hidden lg:block" />
                  <span className="lg:hidden"> </span>
                  Generator
                </h1>
                <p className="h-auto justify-center text-neutral-800 text-sm md:text-base font-normal leading-normal mt-5 max-w-full">
                  Use AI Ease &apos;s online text to image AI generator and
                  quickly get fantastic pieces with a few simple clicks. Type it
                  down, choose a style, and see your dream vision come alive in
                  seconds to use, share, or even sell.
                </p>
              </hgroup>
              <div className="hidden lg:block">
                <LinkButton
                  GTMName="ai-hairstyle-generator-starter"
                  path="/tool/ai-hairstyle-generator"
                  name="Get Started"
                />
              </div>
            </div>
            <div className="lg:flex-1 flex justify-center">
              <div className="w-full max-w-sm md:max-w-lg lg:max-w-full overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-hero_iddee9.png"
                  alt="Free AI Image Generator - Create stunning AI-generated artwork from text prompts with AI Ease"
                  width={714}
                  height={477}
                  className="w-full"
                  priority
                />
              </div>
            </div>
            <div className="block lg:hidden w-full">
              <LinkButton
                GTMName="ai-hairstyle-generator-starter-mobile"
                path="/tool/ai-hairstyle-generator"
                name="Get Started"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="pt-20">
        {ImageIntroduces.map((item: ImageIntroduceItemProps, index: number) => (
          <ImageIntroduceItem
            key={index}
            title={item.title}
            width={item.width}
            height={item.height}
            paragraph={item.paragraph}
            imageSrc={item.imageSrc}
            index={index}
          />
        ))}
      </section>
      <section className="bg-[url('/a.svg')] bg-no-repeat bg-cover overflow-hidden w-full pt-20 pb-20">
        <div className="max-w-7xl mx-auto w-full px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
            How to Generate AI Images
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
            {AIHairStyleStepArr.map((item, index) => (
              <div className="w-full md:w-1/3" key={index}>
                <Image
                  src={item.img}
                  alt={`${item.title} - AI image generation step ${index + 1}`}
                  width={480}
                  height={325}
                  className=" w-full"
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

interface ImageIntroduceItemProps {
  title: string;
  width: number;
  height: number;
  paragraph: string;
  imageSrc: string;
  index?: number;
}
function ImageIntroduceItem({
  title,
  width,
  height,
  paragraph,
  imageSrc,
  index,
}: ImageIntroduceItemProps) {
  const isEven = index! % 2 === 0;
  return (
    <>
      <h2
        className={cn(
          "text-neutral-800 text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-15 text-center",
          index === 4 ? "" : "hidden"
        )}
      >
        AI Image Generator for Anyone and Any Purpose
      </h2>
      <div
        className={cn(
          "max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12 justify-between items-start w-full mb-16 lg:mb-20 px-4",
          isEven ? "lg:flex-row" : "lg:flex-row-reverse"
        )}
      >
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="w-full max-w-md md:max-w-lg lg:max-w-full overflow-hidden rounded-lg">
            <Image
              src={imageSrc}
              alt={`${title} - AI image generation example showcasing ${title.toLowerCase()}`}
              width={width}
              height={height}
              className="w-full "
              priority
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <hgroup>
            <h2 className="text-neutral-800 text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-4">
              {title}
            </h2>
            <p className="text-neutral-800 text-sm md:text-base font-normal leading-relaxed mb-6">
              {paragraph}
            </p>
          </hgroup>
          <LinkButton
            GTMName={`ai-hairstyle-generator-example-${index}`}
            path="/tool/ai-hairstyle-generator"
            name="Get Started"
          />
        </div>
      </div>
    </>
  );
}
