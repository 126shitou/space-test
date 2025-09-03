import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { Result } from "@/lib/utils/result";
import { createDb } from "@/lib/db";
import { blogs, type Blog } from "@/lib/db/schema/article";
import { eq } from "drizzle-orm";

/**
 * GET /api/admin/article/[id]
 * 获取单篇文章详细信息
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDb();
    const { id } = await params;
    customLog("获取文章详细信息", JSON.stringify({ id }));

    const [article] = await db.select().from(blogs).where(eq(blogs.id, id));

    if (!article) {
      return NextResponse.json(Result.fail("文章不存在"), { status: 404 });
    }

    // 增加浏览量
    await db
      .update(blogs)
      .set({ viewCount: article.viewCount + 1 })
      .where(eq(blogs.id, id));

    return NextResponse.json(
      Result.success({
        article: {
          ...article,
          viewCount: article.viewCount + 1, // 返回更新后的浏览量
        },
      })
    );
  } catch (error) {
    customLog("获取文章详细信息失败", JSON.stringify(error));
    return NextResponse.json(Result.fail("获取文章详细信息失败"), {
      status: 500,
    });
  }
}

/**
 * PUT /api/admin/article/[id]
 * 更新博客文章
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDb();

    const { id } = await params;
    const body = await request.json();
    const { title, content, summary, author, category, tags, status } = body;

    customLog("管理员更新博客文章", JSON.stringify({ id, title, status }));

    // 构建更新数据
    const updateData: Partial<Blog> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) {
      updateData.status = status;
      // 如果状态改为已发布且之前没有发布时间，则设置发布时间
      if (status === "published") {
        const [existingArticle] = await db
          .select({ publishedAt: blogs.publishedAt })
          .from(blogs)
          .where(eq(blogs.id, id));

        if (existingArticle && !existingArticle.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    // 更新文章
    const [updatedArticle] = await db
      .update(blogs)
      .set(updateData)
      .where(eq(blogs.id, id))
      .returning();

    if (!updatedArticle) {
      return NextResponse.json(Result.fail("文章不存在"), { status: 404 });
    }

    return NextResponse.json(
      Result.success({
        article: updatedArticle,
        message: "博客文章更新成功",
      })
    );
  } catch (error) {
    customLog("管理员更新博客文章失败", JSON.stringify(error));
    return NextResponse.json(Result.fail("更新博客文章失败"), {
      status: 500,
    });
  }
}

/**
 * DELETE /api/admin/article/[id]
 * 删除博客文章
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = createDb();

    const { id } = await params;
    customLog("管理员删除博客文章", JSON.stringify({ id }));

    // 删除文章
    const [deletedArticle] = await db
      .delete(blogs)
      .where(eq(blogs.id, id))
      .returning();

    if (!deletedArticle) {
      return NextResponse.json(Result.fail("文章不存在"), { status: 404 });
    }

    return NextResponse.json(
      Result.success({
        message: "博客文章删除成功",
        deletedId: id,
      })
    );
  } catch (error) {
    customLog("管理员删除博客文章失败", JSON.stringify(error));
    return NextResponse.json(Result.fail("删除博客文章失败"), {
      status: 500,
    });
  }
}
