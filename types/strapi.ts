export interface linkBtnProps {
  id: number;
  url: string;
  name: string;
  target: string;
}

export interface Highlight {
  id: number;
  text1: string;
  span: string;
  text2: string;
  link: string;
}

export interface IntroduceItemProps {
  id: number;
  heading: string;
  image: string;
  video: string;
  description: Highlight[];
  link: linkBtnProps;
}

export interface stepItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface FAQProps {
  id: number;
  heading: string;
  faqs: FAQItem[];
  sub_heading: Highlight;
}

export interface SEOProps {
  id: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  metaRobots: string;
  structuredData: JSON;
  metaViewport: string;
  canonicalURL: string;
  metaImage: string;
}
