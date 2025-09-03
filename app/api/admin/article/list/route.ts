import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { Result } from "@/lib/utils/result";
import { createDb } from "@/lib/db";
import { blogs, type Blog } from "@/lib/db/schema/article";
import { eq, and, like, count, desc, ilike } from "drizzle-orm";

// 查询参数类型定义
type QueryParams = {
  title?: string; // 标题模糊查询
  status?: "draft" | "published" | "offline"; // 状态查询
  category?: string; // 分类查询
  author?: string; // 作者查询
  page?: number; // 页码
  pageSize?: number; // 每页数量
};

/**
 * GET /api/admin/article/list
 * 管理员分页查询博客文章接口，支持多条件查询
 */
export async function GET(request: Request) {
  try {
    const db = createDb();

    const { searchParams } = new URL(request.url);

    // 解析查询参数
    const params: QueryParams = {
      title: searchParams.get("title") || undefined,
      status:
        (searchParams.get("status") as "draft" | "published" | "offline") ||
        undefined,
      category: searchParams.get("category") || undefined,
      author: searchParams.get("author") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "10"),
    };

    customLog("管理员分页查询博客文章", JSON.stringify(params));

    // 执行查询
    const result = await handleArticleQuery(params);

    return NextResponse.json(
      Result.success({
        articles: result.articles.map(formatArticleResponse),
        total: result.total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(result.total / params.pageSize!),
      })
    );
  } catch (error) {
    customLog("管理员分页查询博客文章失败", JSON.stringify(error));
    return NextResponse.json(Result.fail("查询博客文章失败"), {
      status: 500,
    });
  }
}

/**
 * 处理博客文章查询逻辑
 */
const handleArticleQuery = async (
  params: QueryParams
): Promise<{ articles: Blog[]; total: number }> => {
  const { title, status, category, author, page = 1, pageSize = 10 } = params;
  const db = createDb();

  // 构建查询条件
  const conditions = [];

  // 标题模糊查询
  if (title) {
    conditions.push(ilike(blogs.title, `%${title}%`));
  }

  // 状态查询
  if (status) {
    conditions.push(eq(blogs.status, status));
  }

  // 分类查询
  if (category) {
    conditions.push(eq(blogs.category, category));
  }

  // 作者查询
  if (author) {
    conditions.push(eq(blogs.author, author));
  }

  // 组合查询条件
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 查询总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(blogs)
    .where(whereClause);

  // 分页查询数据
  const articles = await db
    .select()
    .from(blogs)
    .where(whereClause)
    .orderBy(desc(blogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { articles, total };
};

/**
 * 格式化博客文章响应数据（列表用，不返回完整content）
 */
const formatArticleResponse = (article: Blog) => {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    author: article.author,
    category: article.category,
    tags: article.tags,
    status: article.status,
    viewCount: article.viewCount,
    publishedAt: article.publishedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    // 不返回完整的content内容，减少数据传输量
    contentPreview: article.content
      ? article.content.substring(0, 200) + "..."
      : null,
  };
};
