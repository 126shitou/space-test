"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { sendGTMEvent } from "@next/third-parties/google";
import { FAQProps } from "@/types/strapi";

// FAQ项目接口定义
interface FAQItem {
  id: number;
  content: string;
  answer?: string;
}

/**
 * FAQ组件 - 可复用的常见问题解答组件
 * @param GTMName - Google Tag Manager事件名称
 * @param items - FAQ项目数组，可选，默认使用内置数据
 * @param title - 左侧标题
 * @param description - 左侧描述文本
 * @param contactEmail - 联系邮箱
 * @param buttonText - 按钮文本
 * @param buttonHref - 按钮链接
 * @param showLeftLayout - 是否显示左侧布局，默认false
 */
export default function FAQ({
  GTMName,
  faqData,
}: {
  GTMName: string;
  faqData?: FAQProps;
}) {
  if (!faqData) return null;
  // 显示完整的FAQ区域（包含左侧布局）
  return (
    <section className="my-14 lg:my-28 mx-auto flex flex-col lg:flex-row w-full max-w-[1332px] gap-4 lg:gap-12 min-h-100 px-4 sm:px-8 ">
      <div className=" lg:max-w-md">
        <h2 className="text-2xl lg:text-3xl 3xl:text-4xl  font-bold mb-6 leading-11 text-center lg:text-left">
          {faqData.heading}
        </h2>
        <p className=" text-sm md:text-base text-center lg:text-left text-neutral-600 ">
          <span className="md:whitespace-nowrap">
            {faqData.sub_heading.text1}
          </span>
          {faqData.sub_heading.span && (
            <span className="pl-2 pr-1 font-bold text-primary">
              {faqData.sub_heading.span}
            </span>
          )}
          <span>{faqData.sub_heading.text2}</span>
        </p>
      </div>

      <Accordion type="single" collapsible className="mb-5 w-full">
        {faqData.faqs.map((item) => (
          <AccordionItem key={item.id} value={`item-${item.id}`}>
            <AccordionTrigger
              className="text-zinc-800  text-normal font-bold leading-tight text-lg  xl:text-xl    hover:no-underline cursor-pointer text-left"
              onClick={() => {
                sendGTMEvent({
                  event: "ToolFaqClick",
                  ToolFAQ: `${GTMName}-${item.id}`,
                });
              }}
            >
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="  text-neutral-600 text-sm md:text-base  ">
              {item.answer || "暂无内容，欢迎补充。"}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

// 导出类型定义供其他组件使用
export type { FAQItem, FAQProps };
