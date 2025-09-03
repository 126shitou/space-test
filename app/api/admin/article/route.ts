import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { Result } from "@/lib/utils/result";
import { createDb } from "@/lib/db";
import { blogs } from "@/lib/db/schema/article";

/**
 * POST /api/admin/article
 * 创建博客文章接口
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, summary, author, category, tags, status } = body;
    const db = createDb();

    // 参数验证
    if (!title || !content) {
      return NextResponse.json(Result.fail("标题和内容不能为空"), {
        status: 400,
      });
    }

    customLog(
      "管理员创建博客文章",
      JSON.stringify({ title, author, category, status })
    );

    // 创建文章
    const [newArticle] = await db
      .insert(blogs)
      .values({
        title,
        content,
        summary,
        author: author || "管理员",
        category,
        tags,
        status: status || "draft",
        publishedAt: status === "published" ? new Date() : null,
      })
      .returning();

    return NextResponse.json(
      Result.success({
        article: newArticle,
        message: "博客文章创建成功",
      })
    );
  } catch (error) {
    customLog("管理员创建博客文章失败", JSON.stringify(error));
    return NextResponse.json(Result.fail("创建博客文章失败"), {
      status: 500,
    });
  }
}
