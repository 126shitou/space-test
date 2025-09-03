"use server";
import { customError, customSuccess } from "@/lib/utils";
import { Result } from "@/lib/utils/result";
import { createClient } from "@/lib/db/supabase/server";
import { createDb } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

export async function getUserInfo() {
  try {
    const db = createDb();

    const supabase = await createClient();

    const getUserStart = Date.now();
    const { data } = await supabase.auth.getUser();
    const getUserEnd = Date.now();
    customSuccess("获取用户信息耗时", `${getUserEnd - getUserStart}ms`);

    const uid = data.user?.id || null;

    if (!uid) {
      return Result.fail("用户未登录");
    }

    // 根据uid从数据库查询用户数据
    const userFromDb = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, uid))
      .limit(1);

    if (userFromDb.length === 0) {
      return Result.fail("用户不存在");
    }

    const user = userFromDb[0];

    customSuccess(
      "service getUserInfo success",
      `从数据库获取用户数据：${JSON.stringify(user)}`
    );

    return Result.success(user);
  } catch (error) {
    customError(
      "servics > user getUserInfo",
      `获取用户信息失败,Error：${JSON.stringify(error)}`
    );
    if (error instanceof Error) {
      return Result.fail(error.message);
    }
    return Result.fail("获取用户信息失败");
  }
}
