import { notFound } from "next/navigation";
import styles from "./blog.module.css";

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ lng: string; slug: string }>;
}) {
  const { slug } = await params;

  const response = await fetch(
    `${process.env.STRAPI_API_URL}/api/articles?filters[slug][$eq]=${slug}&populate=*`
  );
  if (!response.ok) {
    notFound();
  }
  const res = await response.json();
  if (res.data.length !== 1) {
    notFound();
  }

  const article = res.data[0];

  return (
    <div className="max-w-[1360px] mx-auto px-4 py-8">
      <div
        className={`${styles.articleContent} w-full border border-violet-600/20 rounded-2xl p-6 `}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
