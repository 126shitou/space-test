import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { Result } from "@/lib/utils/result";
import { createDb } from "@/lib/db";
import { medias, type Media } from "@/lib/db/schema/generation";
import {
  eq,
  and,
  like,
  count,
  arrayContains,
  desc,
  inArray,
} from "drizzle-orm";

// 查询参数类型定义
type QueryParams = {
  type?: string; // 媒体文件MIME类型
  mediaType?: string; // 媒体类型：image或video
  category?: string; // 标签分类（单个分类查询）
  supabaseId?: string; // 用户ID
  recordId?: string; // 记录ID
  page?: number; // 页码
  pageSize?: number; // 每页数量
};

// 批量设置标签请求参数类型定义
type BatchSetCategoryParams = {
  mediaIds: string[]; // 媒体文件ID数组
  category: string[]; // 要设置的标签数组
};

// 批量删除请求参数类型定义
type BatchDeleteParams = {
  mediaIds: string[]; // 要删除的媒体文件ID数组
};

// 编辑媒体文件请求参数类型定义
type EditMediaParams = {
  id: string; // 媒体文件ID
  category?: string[]; // 标签分类数组（可选）
  aspectRatio?: string; // 宽高比类型（可选）
  supabaseId?: string; // 用户ID（可选）
  posterUrl?: string; // 视频封面图片URL，存储到meta中
};

/**
 * GET /api/admin/media
 * 管理员查询媒体文件接口，支持分页和多条件查询
 */
export async function GET(request: Request) {
  customLog("api > admin > media", "query media data");
  const db = createDb();

  const { searchParams } = new URL(request.url);

  // 获取查询参数
  const queryParams: QueryParams = {
    type: searchParams.get("type") || undefined,
    mediaType: searchParams.get("mediaType") || undefined,
    category: searchParams.get("category") || undefined,
    supabaseId: searchParams.get("supabaseId") || undefined,
    recordId: searchParams.get("recordId") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "10"),
  };

  customLog(
    "api > admin > media",
    `Query parameters: ${JSON.stringify(queryParams)}`
  );

  try {
    const result = await handleMediaQuery(queryParams);

    if (result.medias.length > 0) {
      customLog(
        "api > admin > media",
        `Found ${result.medias.length} medias, total: ${result.total}`
      );

      return NextResponse.json(
        Result.success(
          {
            medias: result.medias.map((media) => formatMediaResponse(media)),
            total: result.total,
            page: queryParams.page,
            pageSize: queryParams.pageSize,
            totalPages: Math.ceil(result.total / (queryParams.pageSize || 10)),
          },
          "查询媒体文件成功"
        )
      );
    } else {
      customLog("api > admin > media", "No medias found");

      return NextResponse.json(
        Result.success(
          {
            medias: [],
            total: 0,
            page: queryParams.page,
            pageSize: queryParams.pageSize,
            totalPages: 0,
          },
          "未找到媒体文件"
        )
      );
    }
  } catch (error) {
    customLog(
      "api > admin > media",
      `Error querying medias: ${JSON.stringify(error)}`
    );

    return NextResponse.json(
      Result.fail(error instanceof Error ? error.message : "查询媒体文件失败"),
      { status: 500 }
    );
  }
}

/**
 * 处理媒体查询逻辑
 * @param params 查询参数
 * @returns 查询结果和总数
 */
const handleMediaQuery = async (
  params: QueryParams
): Promise<{ medias: Media[]; total: number }> => {
  try {
    const db = createDb();

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 10, 100); // 限制最大页面大小为100
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions = [
      ...(params.supabaseId ? [eq(medias.supabaseId, params.supabaseId)] : []),
      ...(params.recordId ? [eq(medias.recordId, params.recordId)] : []),
      ...(params.type ? [eq(medias.type, params.type)] : []),
      ...(params.mediaType
        ? [eq(medias.mediaType, params.mediaType as "image" | "video")]
        : []),
      ...(params.category
        ? [arrayContains(medias.category, [params.category])]
        : []),
      // 默认不查询已删除的媒体
      eq(medias.isDelete, false),
    ].filter(Boolean);

    customLog(
      "api > admin > media > handleMediaQuery",
      `Query conditions: ${conditions.length} filters applied`
    );

    // 构建where条件
    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(medias)
      .where(whereCondition);

    const total = totalResult[0]?.count || 0;

    // 执行分页查询
    const mediaFromDb = await db
      .select()
      .from(medias)
      .where(whereCondition)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(medias.createdAt)); // 按创建时间倒序排列

    customLog(
      "api > admin > media > handleMediaQuery",
      `Database query completed, found ${mediaFromDb.length} medias, total: ${total}, page: ${page}, pageSize: ${pageSize}`
    );

    return { medias: mediaFromDb, total };
  } catch (error) {
    customLog(
      "api > admin > media > handleMediaQuery",
      `Error in media query: ${JSON.stringify(error)}`
    );
    throw error;
  }
};

/**
 * 格式化媒体响应数据
 * @param media 媒体数据
 * @returns 格式化后的响应数据
 */
const formatMediaResponse = (media: Media) => {
  return {
    id: media.id,
    supabaseId: media.supabaseId,
    recordId: media.recordId,
    taskId: media.taskId,
    url: media.url,
    type: media.type,
    mediaType: media.mediaType,
    aspectRatio: media.aspectRatio,
    uploadSource: media.uploadSource,
    category: media.category || [],
    meta: media.meta,
    isDelete: media.isDelete,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  };
};

/**
 * PATCH /api/admin/media
 * 批量设置媒体文件标签category
 */
export async function PATCH(request: Request) {
  customLog("api > admin > media", "batch set category");

  try {
    const db = createDb();

    const body: BatchSetCategoryParams = await request.json();
    const { mediaIds, category } = body;

    // 输入验证
    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      customLog("api > admin > media > PATCH", "Invalid mediaIds parameter");
      return NextResponse.json(
        Result.fail("mediaIds参数无效，必须是非空数组"),
        { status: 400 }
      );
    }

    if (!category || !Array.isArray(category)) {
      customLog("api > admin > media > PATCH", "Invalid category parameter");
      return NextResponse.json(Result.fail("category参数无效，必须是数组"), {
        status: 400,
      });
    }

    // 限制批量操作数量
    if (mediaIds.length > 100) {
      customLog(
        "api > admin > media > PATCH",
        `Too many mediaIds: ${mediaIds.length}`
      );
      return NextResponse.json(Result.fail("批量操作数量不能超过100个"), {
        status: 400,
      });
    }

    customLog(
      "api > admin > media > PATCH",
      `Setting category for ${mediaIds.length} medias: ${JSON.stringify(
        category
      )}`
    );

    // 执行批量更新
    const updateResult = await db
      .update(medias)
      .set({
        category: category,
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(medias.id, mediaIds),
          eq(medias.isDelete, false) // 只更新未删除的媒体
        )
      )
      .returning({ id: medias.id });

    const updatedCount = updateResult.length;

    customLog(
      "api > admin > media > PATCH",
      `Successfully updated ${updatedCount} medias`
    );

    return NextResponse.json(
      Result.success(
        {
          updatedCount,
          updatedIds: updateResult.map((item) => item.id),
          category,
        },
        `成功更新${updatedCount}个媒体文件的标签`
      )
    );
  } catch (error) {
    customLog(
      "api > admin > media > PATCH",
      `Error setting category: ${JSON.stringify(error)}`
    );

    return NextResponse.json(
      Result.fail(error instanceof Error ? error.message : "批量设置标签失败"),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/media
 * 批量删除媒体文件（软删除）
 */
export async function DELETE(request: Request) {
  customLog("api > admin > media", "batch delete medias");

  try {
    const body: BatchDeleteParams = await request.json();
    const { mediaIds } = body;

    // 输入验证
    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      customLog("api > admin > media > DELETE", "Invalid mediaIds parameter");
      return NextResponse.json(
        Result.fail("mediaIds参数无效，必须是非空数组"),
        { status: 400 }
      );
    }

    // 限制批量操作数量
    if (mediaIds.length > 100) {
      customLog(
        "api > admin > media > DELETE",
        `Too many mediaIds: ${mediaIds.length}`
      );
      return NextResponse.json(Result.fail("批量操作数量不能超过100个"), {
        status: 400,
      });
    }

    customLog(
      "api > admin > media > DELETE",
      `Deleting ${mediaIds.length} medias: ${JSON.stringify(mediaIds)}`
    );
    const db = createDb();

    // 执行批量软删除
    const deleteResult = await db
      .update(medias)
      .set({
        isDelete: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          inArray(medias.id, mediaIds),
          eq(medias.isDelete, false) // 只删除未删除的媒体
        )
      )
      .returning({ id: medias.id, url: medias.url });

    const deletedCount = deleteResult.length;

    customLog(
      "api > admin > media > DELETE",
      `Successfully deleted ${deletedCount} medias`
    );

    return NextResponse.json(
      Result.success(
        {
          deletedCount,
          deletedIds: deleteResult.map((item) => item.id),
          deletedUrls: deleteResult.map((item) => item.url),
        },
        `成功删除${deletedCount}个媒体文件`
      )
    );
  } catch (error) {
    customLog(
      "api > admin > media > DELETE",
      `Error deleting medias: ${JSON.stringify(error)}`
    );

    return NextResponse.json(
      Result.fail(
        error instanceof Error ? error.message : "批量删除媒体文件失败"
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/media
 * 编辑单个媒体文件信息（标签、宽高比类型、用户ID）
 */
export async function PUT(request: Request) {
  customLog("api > admin > media", "edit media info");

  try {
    const body: EditMediaParams = await request.json();
    const { id, category, aspectRatio, supabaseId, posterUrl } = body;

    // 输入验证
    if (!id || typeof id !== "string") {
      customLog("api > admin > media > PUT", "Invalid id parameter");
      return NextResponse.json(Result.fail("id参数无效，必须是非空字符串"), {
        status: 400,
      });
    }

    // 检查是否至少提供了一个要更新的字段
    if (
      category === undefined &&
      aspectRatio === undefined &&
      supabaseId === undefined &&
      posterUrl === undefined
    ) {
      customLog("api > admin > media > PUT", "No fields to update");
      return NextResponse.json(
        Result.fail(
          "至少需要提供一个要更新的字段（category、aspectRatio、supabaseId或posterUrl）"
        ),
        { status: 400 }
      );
    }

    // 验证category参数
    if (category !== undefined && !Array.isArray(category)) {
      customLog("api > admin > media > PUT", "Invalid category parameter");
      return NextResponse.json(Result.fail("category参数无效，必须是数组"), {
        status: 400,
      });
    }

    // 验证aspectRatio参数
    if (aspectRatio !== undefined) {
      if (typeof aspectRatio !== "string") {
        customLog(
          "api > admin > media > PUT",
          "Invalid aspectRatio parameter type"
        );
        return NextResponse.json(
          Result.fail("aspectRatio参数无效，必须是字符串"),
          { status: 400 }
        );
      }

      // 验证宽高比格式：必须是 n/m 格式，其中 n 和 m 都是正整数
      const aspectRatioRegex = /^\d+\/\d+$/;
      if (!aspectRatioRegex.test(aspectRatio)) {
        customLog(
          "api > admin > media > PUT",
          `Invalid aspectRatio format: ${aspectRatio}`
        );
        return NextResponse.json(
          Result.fail("aspectRatio格式无效，必须是 n/m 格式（如：16/9、4/3）"),
          { status: 400 }
        );
      }

      // 验证分子和分母都不为0
      const [numerator, denominator] = aspectRatio.split("/").map(Number);
      if (numerator === 0 || denominator === 0) {
        customLog(
          "api > admin > media > PUT",
          `Invalid aspectRatio values: ${aspectRatio}`
        );
        return NextResponse.json(
          Result.fail("aspectRatio的分子和分母都必须大于0"),
          { status: 400 }
        );
      }
    }

    // 验证supabaseId参数
    if (supabaseId !== undefined && typeof supabaseId !== "string") {
      customLog("api > admin > media > PUT", "Invalid supabaseId parameter");
      return NextResponse.json(
        Result.fail("supabaseId参数无效，必须是字符串"),
        { status: 400 }
      );
    }

    customLog(
      "api > admin > media > PUT",
      `Editing media ${id} with fields: ${JSON.stringify({
        category,
        aspectRatio,
        supabaseId,
        posterUrl,
      })}`
    );

    // 构建更新对象
    const updateData: Partial<{
      category: string[];
      aspectRatio: string;
      supabaseId: string;
      meta: any;
      updatedAt: Date;
    }> = {
      updatedAt: new Date(),
    };

    if (category !== undefined) {
      updateData.category = category;
    }
    if (aspectRatio !== undefined) {
      updateData.aspectRatio = aspectRatio;
    }
    if (supabaseId !== undefined) {
      updateData.supabaseId = supabaseId;
    }
    const db = createDb();

    // 如果提供了posterUrl，将其存储到meta字段中（仅限视频类型）
    if (posterUrl !== undefined) {
      // 先获取当前的媒体信息，包括类型和meta数据
      const currentMedia = await db
        .select({
          meta: medias.meta,
          mediaType: medias.mediaType,
        })
        .from(medias)
        .where(eq(medias.id, id))
        .limit(1);

      if (currentMedia.length === 0) {
        customLog("api > admin > media > PUT", `Media not found: ${id}`);
        return NextResponse.json(Result.fail("媒体文件不存在"), {
          status: 404,
        });
      }

      // 检查媒体类型，只有视频类型才能设置posterUrl
      if (currentMedia[0].mediaType !== "video") {
        customLog(
          "api > admin > media > PUT",
          `PosterUrl only allowed for video media, current type: ${currentMedia[0].mediaType}`
        );
        return NextResponse.json(
          Result.fail("posterUrl参数仅适用于视频类型的媒体文件"),
          { status: 400 }
        );
      }

      // 合并现有meta数据和新的posterUrl
      const currentMeta = currentMedia[0].meta || {};
      updateData.meta = {
        ...currentMeta,
        posterUrl: posterUrl,
      };
    }

    // 执行更新操作
    const updateResult = await db
      .update(medias)
      .set(updateData)
      .where(
        and(
          eq(medias.id, id),
          eq(medias.isDelete, false) // 只更新未删除的媒体
        )
      )
      .returning();

    if (updateResult.length === 0) {
      customLog(
        "api > admin > media > PUT",
        `Media not found or already deleted: ${id}`
      );
      return NextResponse.json(Result.fail("媒体文件不存在或已被删除"), {
        status: 404,
      });
    }

    const updatedMedia = updateResult[0];

    customLog("api > admin > media > PUT", `Successfully updated media ${id}`);

    return NextResponse.json(
      Result.success(
        {
          media: formatMediaResponse(updatedMedia),
          updatedFields: {
            ...(category !== undefined && { category }),
            ...(aspectRatio !== undefined && { aspectRatio }),
            ...(supabaseId !== undefined && { supabaseId }),
            ...(posterUrl !== undefined && { posterUrl }),
          },
        },
        "媒体文件信息更新成功"
      )
    );
  } catch (error) {
    customLog(
      "api > admin > media > PUT",
      `Error updating media: ${JSON.stringify(error)}`
    );

    return NextResponse.json(
      Result.fail(error instanceof Error ? error.message : "编辑媒体文件失败"),
      { status: 500 }
    );
  }
}
