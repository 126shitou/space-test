import Image from "next/image";
import LinkButton from "@/components/LinkButton";
import { cn } from "@/lib/utils";
import FAQ from "@/components/FAQ";
import { IntroduceItemProps, SEOProps, stepItem } from "@/types/strapi";
import { languages } from "@/i18n/config";
import Link from "next/link";

import {
  SITE_CONFIG,
  ROBOTS_CONFIG,
  getOpenGraphLocale,
  generateLanguageAlternates,
  generateCanonicalUrl,
} from "@/lib/config/seo";
import { Metadata } from "next";

/**
 * 生成静态参数函数 - 用于SSG静态站点生成
 * 为支持的语言预生成静态页面，提升页面加载性能
 * @returns 包含所有支持语言的参数数组
 */
export async function generateStaticParams() {
  // 为每种语言生成静态参数
  return languages.map((lng) => ({
    lng,
  }));
}

const getStrapiData = async () => {
  const response = await fetch(
    `${process.env.STRAPI_API_URL}/api/crush-effects-showcase?populate=all`
    // {
    //   next: { revalidate: 43200 }, // 12小时缓存
    // }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch crush effects data");
  }
  return response.json();
};

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
  const { data } = await getStrapiData();

  const seoData = data.seo as SEOProps;

  // 页面标题 - 显示在浏览器标签页和搜索结果中
  const title = seoData.metaTitle;

  // 页面描述 - 显示在搜索结果摘要中，影响点击率
  const description = seoData.metaDescription;

  // 关键词 - 帮助搜索引擎理解页面内容主题
  const keywords = seoData.keywords;

  // 当前页面的完整URL - 用于canonical链接和社交分享
  const url = generateCanonicalUrl(lng, seoData.canonicalURL);

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

    // 替代链接配置
    alternates: {
      canonical: url, // 规范链接，防止重复内容问题
      // 多语言版本链接映射 - 帮助搜索引擎理解不同语言版本的关系
      languages: generateLanguageAlternates(seoData.canonicalURL),
    },
  };
}

export default async function SquishEffectPage({
  params,
}: {
  params: Promise<{ lng: string }>;
}) {
  // 获取当前页面的语言参数
  const { lng } = await params;
  const { data: strapiData } = await getStrapiData();

  return (
    <div className="w-full h-full relative">
      {/* 产品页特有的结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(strapiData.seo.structuredData),
        }}
      />
      <section className="w-full h-full">
        <div className="relative overflow-hidden aspect-[16/9] md:aspect-[21/9] mx-2 sm:mx-4 lg:mx-5 my-2 sm:my-4 lg:my-5 rounded-lg sm:rounded-xl lg:rounded-2xl">
          {/* 背景视频 */}
          <video
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            autoPlay
            muted
            poster={strapiData.hero.image}
            loop
            playsInline
            src={strapiData.hero.video}
          />

          {/* 内容层 */}
          <div className="absolute z-10 bottom-4 sm:bottom-10 md:bottom-12  xl:bottom-18 2xl:bottom-20 flex items-end justify-start px-2 sm:px-8 lg:px-15 sm:py-4 ">
            <div className="text-left w-full max-w-[350px] sm:max-w-lg lg:max-w-2xl">
              <hgroup className="mb-3 sm:mb-6">
                <h1 className="text-white text-2xl md:text-3xl lg:text-4xl xl:text-5xl 3xl:text-6xl  font-bold leading-tight mb-1 sm:mb-3 lg:mb-4">
                  <span className="block sm:inline">
                    {strapiData.hero.heading}
                  </span>
                </h1>
                <p className="text-white text-sm lg:text-base 2xl:text-lg font-normal mb-3 sm:mb-5 lg:mb-6">
                  {strapiData.hero.sub_heading}
                </p>
              </hgroup>
              <div className="w-full flex justify-start">
                <LinkButton
                  GTMName={strapiData.GTMBaseName}
                  path={strapiData.hero.link.url}
                  isHero
                  name={strapiData.hero.link.name}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1332px] pt-10 mx-auto px-10 xl:px-20 2xl:px-0 ">
        <h2 className="text-center font-bold  text-2xl lg:text-3xl 3xl:text-4xl">
          {strapiData.feature.title}
        </h2>
        <div className="pt-8 md:pt-12 lg:pt-16">
          {strapiData.feature.introduce.map(
            (item: IntroduceItemProps, index: number) => {
              const isEven = index! % 2 === 0;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "w-full  flex flex-col lg:flex-row  lg:gap-12 xl:gap-16 2xl:gap-18 3xl:gap-20 justify-between items-start mb-14 md:mb-16 lg:mb-24 ",
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  )}
                >
                  <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                    <div className="w-full max-w-md md:max-w-lg lg:max-w-full mb-4 aspect-video">
                      <video
                        className="w-full object-cover rounded-lg"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={item.image}
                        src={item.video}
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 text-center lg:text-left lg:pt-6">
                    <hgroup>
                      <h2 className="text-neutral-80 font-bold leading-tight mb-4 text-xl 3xl:text-2xl">
                        {item.heading}
                      </h2>
                      <p className="text-neutral-600 text-base  font-normal leading-relaxed mb-6">
                        {item.description.map((item) => (
                          <span key={item.id}>
                            {item.text1}
                            {item.span && (
                              <Link
                                href={item.link || ""}
                                className="text-primary cursor-pointer px-1"
                              >
                                {item.span}
                              </Link>
                            )}
                            {item.text2}
                          </span>
                        ))}
                      </p>
                    </hgroup>
                    <LinkButton
                      GTMName={`${strapiData.GTMBaseName}-introduce-${index}`}
                      path={item.link.url}
                      name={item.link.name}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      <section className=" bg-[url('/ai-video-generator/a.svg')] bg-no-repeat bg-cover overflow-hidden w-full ">
        <div className=" w-full max-w-[1332px]  py-10 mx-auto px-10 xl:px-20 2xl:px-0 ">
          <h2 className="text-center font-bold  text-2xl lg:text-3xl 3xl:text-4xl mb-10">
            {strapiData.howtouse.heading}
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
            {strapiData.howtouse.steps.map((item: stepItem, index: number) => (
              <div
                className="w-full max-w-[428px] md:max-w-full md:w-1/3 mx-auto"
                key={index}
              >
                <Image
                  src={item.image}
                  alt={`${item.title} - ${item.description}`}
                  width={428}
                  height={286}
                  className="aspect-[428/286] w-full  rounded-xl"
                />
                <h3 className="py-3 font-bold leading-tight text-lg  xl:text-xl  3xl:text-2xl text-center md:text-left">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-sm md:text-base text-center md:text-left hyphens-auto break-words">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQ GTMName={strapiData.GTMBaseName} faqData={strapiData.faq} />
    </div>
  );
}
