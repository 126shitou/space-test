// 添加静态生成配置
// export const dynamic = 'force-static'
// export const revalidate = 86400 // 24小时重新验证

import { cn } from "@/lib/utils";
import Image from "next/image";
import LinkButton from "../LinkButton";
import Link from "next/link";
import FAQ from "@/components/FAQ";
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
  const ImageIntroduce: ImageIntroduceProps[] = [
    {
      title: "Generate AI Images from Text Prompts",
      paragraph:
        "Without any extra complicated skills, AI Ease offers the easiest and fastest imagecreator to convert your text idea into vibrant and delicate AI images in mereseconds.Our AI understands, generatively fills, and outputs the image withconsistent subjects, objects, and backgrounds, even if you write the simplestprompt like “A panda”.Ease yourself, and confidently try our online text to imageAI tool to create artistic AI images now!",
      width: 692,
      height: 539,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-1_m86eth.png",
    },
    {
      title: "Improve Consistency with ImageReference",
      paragraph:
        "Generate AI images with the face and content from your input images to getmore satisfying results when using AI Ease’s online image-to-image AIgenerator. Our tool can learn, imitate, and output similar AI photos by adjustingthe intensity of the reference strength. The higher the intensity is, the moresimilar the results will be when creating consistent visuals in our AI picturegenerator.",
      width: 704,
      height: 413,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-2_dtkod1.png",
    },
    {
      title: "Stable Style Control Ability",
      paragraph:
        "AI Ease has pre-trained a wide list of styles covering realistic, futuristic,traditional, and trending art styles. All these styles are perfect for all input textprompts to define the image with unprecedented stability. With such stablecontrol over style, easily generate your consistent story illustrations or comicswith ease by using our online AI art generator. Our team is continuouslyupdating our art templates with fancier, stylish, and playful styles.",
      width: 692,
      height: 423,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-3_jyanhl.png",
    },
    {
      title: "Exclusive AI Image Creation Features",
      paragraph:
        "AI Ease gives helpful tools to provide a better user experience: Random promptsand the Remix tool. For beginners, use our random prompt feature to getinspired and start the amazing journey to image generation. For skilled users,experiment and explore more possibilities of our powerful AI image generator. Itmeans that you can reimagine a new image in a different art style with the sameprompt and image aspect ratio.",
      width: 686,
      height: 325,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-4_mrd7f4.png",
    },
    {
      title: "Get Unlimited Image Sources",
      paragraph:
        "Designers, social media influencers, and marketing experts can use text promptsto generate faces, characters, landscapes, products, and any beautiful visuals ofdifferent styles in AI Ease. Use our AI image generator to create your one-of-a-kind images to use, sell, or post without worrying about the image source.",
      width: 682,
      height: 393,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-5_truq3l.png",
    },
    {
      title: "Visualize Prompts to Product Design Ideas",
      paragraph:
        "For the e-commerce team, our AI generator is the one-click wonder to turn yourideas into a draft without using complicated software, especially when workingwith a pile of tasks. Sketch out the product shape, color, materials, backgrounds,lighting, and display view, and see it become your first draft in seconds, anddiscuss where to polish with your team, saving a significant amount of time andspeeding up workflow.",
      width: 718,
      height: 341,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-6_c8kw4d.png",
    },
    {
      title: "Create Your Own AI Photoshoot Studio",
      paragraph:
        "Upload your model image, and use our image reference tool to create morephotoshoots without repaying the high cost for the models, studios, and anyequipment. For individual content creators and small teams, AI Ease is a cheapersolution with stunning effects.",
      width: 648,
      height: 433,
      imageSrc:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-introduce-7_gbjed9.png",
    },
  ];

  const AIImageStepArr = [
    {
      id: 1,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-howtodo-1_eyfbi6.png",
      paragraph:
        "Write your text prompts for AI image generations inour text box. The more detailed your prompts are,the more delicate the output will be.",
      title: "Step 1: Enter Text Prompts",
    },
    {
      id: 2,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-howtodo-2_jadil2.png",
      paragraph:
        "Pick your preferred AI generation style in our stylelibrary, and then choose the number and aspect ratioof AI generated images.",
      title: "Step 2: Choose Styles and Settings",
    },
    {
      id: 3,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-howtodo-3_ackw6l.png",
      paragraph:
        "Once ready, click the “Generate” button, and our toolwill output your AI images in seconds. Download andshare it when satisfied.",
      title: "Step 3: Generate and Download",
    },
  ];

  const AIEaseImagesItemArr = [
    {
      id: 1,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-more-1_rcu6fy.png",
      title: "AI Art Generator",
      Imageswidth: 299,
      Imagesheight: 254,
    },
    {
      id: 2,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-more-2_f6yixl.png",
      title: "AI Design Generator",
      Imageswidth: 396,
      Imagesheight: 255,
    },
    {
      id: 3,
      img: "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-more-3_yzvhzg.png",
      title: "AI Logo Generator",
      Imageswidth: 350,
      Imagesheight: 255,
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
                  GTMName="ai-image-generator-starter"
                  path="/tool/ai-image-generator"
                  name="Get Started"
                />
              </div>
            </div>
            <div className="lg:flex-1 flex justify-center">
              <div className="w-full max-w-sm md:max-w-lg lg:max-w-full aspect-[718/539] overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-hero_n31vdl.png"
                  alt="Free AI Image Generator Hero Photo"
                  width={718}
                  height={539}
                  className="w-full"
                  priority
                />
              </div>
            </div>
            <div className="block lg:hidden w-full">
              <LinkButton
                GTMName="ai-image-generator-starter-mobile"
                path="/tool/ai-image-generator"
                name="Get Started"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-20">
        {ImageIntroduce.map((item: ImageIntroduceProps, index: number) => (
          <ImageIntroduceComp
            key={index}
            title={item.title}
            paragraph={item.paragraph}
            imageSrc={item.imageSrc}
            index={index}
            width={item.width}
            height={item.height}
          />
        ))}
      </section>

      <section className="bg-[url('/a.svg')] bg-no-repeat bg-cover overflow-hidden w-full pt-20">
        <div className="max-w-7xl mx-auto w-full px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
            How to Generate AI Images
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
            {AIImageStepArr.map((item, index) => (
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
              GTMName="ai-image-generator-howTo"
              path="/tool/ai-image-generator"
              name="Get Started"
            />
          </div>
        </div>
      </section>

      <section className="pt-20 max-w-7xl mx-auto w-full px-4">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
          More Free Text to Image Tool from AI Ease
        </h2>
        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
          {AIEaseImagesItemArr.map((item, index) => (
            <div
              key={index}
              className="w-full md:w-1/3 flex flex-col items-center"
            >
              <div className="w-full max-w-xs md:max-w-sm lg:max-w-md h-48 md:h-52 lg:h-56 overflow-hidden rounded-lg  flex justify-center">
                <Image
                  src={item.img}
                  alt={`${
                    item.title
                  } - Free AI tool for creating ${item.title.toLowerCase()}`}
                  width={item.Imageswidth}
                  height={item.Imagesheight}
                  className="h-full"
                />
              </div>
              <h3 className="py-3 text-lg md:text-xl font-bold text-center">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <FAQ GTMName="ai-cartoon-generator-faq" />
    </div>
  );
}

interface ImageIntroduceProps {
  title: string;
  paragraph: string;
  imageSrc: string;
  index?: number;
  width: number;
  height: number;
}

function ImageIntroduceComp({
  title,
  paragraph,
  imageSrc,
  index,
  width,
  height,
}: ImageIntroduceProps) {
  const isEven = index! % 2 === 0;
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-12 justify-between items-start w-full mb-16 lg:mb-20 px-4",
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      )}
    >
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
        <div className="w-full max-w-md md:max-w-lg lg:max-w-full  overflow-hidden rounded-xl">
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
      <div className="w-full lg:w-1/2  lg:text-left">
        <hgroup>
          <h2 className="text-neutral-800 text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-4">
            {title}
          </h2>
          <p className="text-neutral-800 text-sm md:text-base  font-normal leading-relaxed mb-6">
            {paragraph}
          </p>
        </hgroup>
        <LinkButton
          GTMName={`ai-image-generator-example-${index}`}
          path="/tool/ai-image-generator"
          name="Get Started"
        />
      </div>
    </div>
  );
}
