import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { createDb } from "@/lib/db";
import { users, type User } from "@/lib/db/schema/user";
import { eq, and, like, isNotNull, count } from "drizzle-orm";

type QueryParams = {
  email?: string;
  name?: string;
  status?: string;
  lastLogin?: string;
  supabaseId?: string;
  page?: number;
  pageSize?: number;
};

export async function GET(request: Request) {
  customLog("api > admin > user", "query user data");

  const { searchParams } = new URL(request.url);

  // 获取查询参数
  const queryParams: QueryParams = {
    email: searchParams.get("email") || undefined,
    name: searchParams.get("name") || undefined,
    status: searchParams.get("status") || undefined,
    lastLogin: searchParams.get("lastLogin") || undefined,
    supabaseId: searchParams.get("supabaseId") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "10"),
  };

  customLog(
    "api > admin > user",
    `Query parameters: ${JSON.stringify(queryParams)}`
  );

  try {
    const result = await handleUserQuery(queryParams);

    if (result.users.length > 0) {
      customLog(
        "api > admin > user",
        `Found ${result.users.length} users, total: ${result.total}`
      );

      return NextResponse.json({
        success: true,
        data: {
          users: result.users.map((user) =>
            formatUserResponse(user, queryParams.status)
          ),
          pagination: {
            page: queryParams.page || 1,
            pageSize: queryParams.pageSize || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (queryParams.pageSize || 10)),
          },
        },
        message: "获取用户信息成功",
      });
    } else {
      customLog("api > admin > user", "No users found matching criteria");

      return NextResponse.json({
        success: true,
        data: {
          users: [],
          pagination: {
            page: queryParams.page || 1,
            pageSize: queryParams.pageSize || 10,
            total: 0,
            totalPages: 0,
          },
        },
        message: "未找到匹配的用户",
      });
    }
  } catch (error) {
    customLog(
      "api > admin > user",
      `Error querying user: ${JSON.stringify(error)}`
    );

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "服务器内部错误",
      },
      { status: 500 }
    );
  }
}

const handleUserQuery = async (
  params: QueryParams
): Promise<{ users: User[]; total: number }> => {
  try {
    const db = createDb();

    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 10, 100); // 限制最大页面大小为100
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions = [
      ...(params.supabaseId ? [eq(users.supabaseId, params.supabaseId)] : []),
      ...(params.email ? [eq(users.email, params.email)] : []),
      ...(params.name ? [like(users.name, `%${params.name}%`)] : []),
      ...(params.lastLogin ? [isNotNull(users.lastLogin)] : []),
    ].filter(Boolean);

    customLog(
      "api > admin > user > handleUserQuery",
      `Query conditions: ${conditions.length} filters applied`
    );

    // 构建where条件
    const whereCondition =
      conditions.length > 0 ? and(...conditions) : undefined;

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(users)
      .where(whereCondition);

    const total = totalResult[0]?.count || 0;

    // 执行分页查询
    const userFromDb = await db
      .select()
      .from(users)
      .where(whereCondition)
      .limit(pageSize)
      .offset(offset)
      .orderBy(users.createdAt);

    customLog(
      "api > admin > user > handleUserQuery",
      `Database query completed, found ${userFromDb.length} users, total: ${total}, page: ${page}, pageSize: ${pageSize}`
    );

    return { users: userFromDb, total };
  } catch (error) {
    customLog(
      "api > admin > user > handleUserQuery",
      `Error in user query: ${JSON.stringify(error)}`
    );
    throw error;
  }
};

const formatUserResponse = (user: User, status?: string) => {
  return {
    supabaseId: user.supabaseId,
    name: user.name,
    avatar: user.avatar || "",
    email: user.email,
    points: user.points,
    subscriptionType: user.subscriptionType,
    subscriptionStartDate: user.subscriptionsStartDate?.toISOString() || "",
    subscriptionEndDate: user.subscriptionsEndDate?.toISOString() || "",
    lastLogin: user.lastLogin?.toISOString() || "",
    status: status || "normal",
    ipAddr: "", // 数据库中暂无此字段
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};
