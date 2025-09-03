import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { createDb } from "@/lib/db";
import { users, type User } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

type LockUserData = {
  supabaseId: string;
  lockReason?: string;
};

export async function POST(request: Request) {
  customLog("api > admin > user > lock", "lock user account");

  try {
    const body = await request.json();
    const { supabaseId, lockReason } = body as LockUserData;

    customLog(
      "api > admin > user > lock",
      `Locking user: ${supabaseId}, reason: ${
        lockReason || "No reason provided"
      }`
    );

    const lockedUser = await handleUserLock(supabaseId, lockReason);

    if (lockedUser) {
      customLog(
        "api > admin > user > lock",
        `User locked successfully: ${lockedUser.email}`
      );

      return NextResponse.json({
        success: true,
        data: null,
        message: "用户锁定成功",
      });
    } else {
      customLog("api > admin > user > lock", "User not found for locking");

      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "用户不存在",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    customLog(
      "api > admin > user > lock",
      `Error locking user: ${JSON.stringify(error)}`
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

const handleUserLock = async (
  supabaseId: string,
  lockReason?: string
): Promise<User | null> => {
  try {
    // 验证必需参数
    if (!supabaseId) {
      throw new Error("请提供用户ID: supabaseId");
    }
    const db = createDb();

    // 验证用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (existingUser.length === 0) {
      customLog(
        "api > admin > user > lock > handleUserLock",
        `User not found: ${supabaseId}`
      );
      return null;
    }

    // 检查用户是否已经被锁定
    const currentUser = existingUser[0];
    // 由于数据库schema中没有locked状态，我们使用points为-1来标记锁定状态
    if (currentUser.points === -1) {
      customLog(
        "api > admin > user > lock > handleUserLock",
        `User already locked: ${supabaseId}`
      );
      return currentUser;
    }

    // 执行锁定操作 - 使用points=-1来标记锁定状态
    // 保存原始积分到subscriptionsStartDate字段（临时方案）
    const updateFields: any = {
      points: -1, // 使用-1标记锁定状态
      updatedAt: new Date(),
    };

    const lockedUsers = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.supabaseId, supabaseId))
      .returning();

    customLog(
      "api > admin > user > lock > handleUserLock",
      `User lock completed for: ${supabaseId}, reason: ${
        lockReason || "No reason"
      }`
    );

    return lockedUsers.length > 0 ? lockedUsers[0] : null;
  } catch (error) {
    customLog(
      "api > admin > user > lock > handleUserLock",
      `Error in user lock: ${JSON.stringify(error)}`
    );
    throw error;
  }
};
