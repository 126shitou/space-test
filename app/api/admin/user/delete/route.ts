import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

type DeleteUserData = {
  supabaseId: string;
};

export async function POST(request: Request) {
  customLog("api > admin > user > delete", "delete user data");

  try {
    const body = await request.json();
    const { supabaseId } = body as DeleteUserData;
    
    customLog(
      "api > admin > user > delete",
      `Deleting user: ${supabaseId}`
    );

    const deletedUser = await handleUserDelete(supabaseId);
    
    if (deletedUser) {
      customLog(
        "api > admin > user > delete",
        `User deleted successfully: ${deletedUser.email}`
      );
      
      return NextResponse.json({
        success: true,
        data: null,
        message: "用户删除成功"
      });
    } else {
      customLog("api > admin > user > delete", "User not found for deletion");
      
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "用户不存在"
        },
        { status: 404 }
      );
    }
  } catch (error) {
    customLog(
      "api > admin > user > delete",
      `Error deleting user: ${JSON.stringify(error)}`
    );
    
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "服务器内部错误"
      },
      { status: 500 }
    );
  }
}

const handleUserDelete = async (supabaseId: string): Promise<User | null> => {
  try {
    // 验证必需参数
    if (!supabaseId) {
      throw new Error("请提供用户ID: supabaseId");
    }

    // 验证用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (existingUser.length === 0) {
      customLog(
        "api > admin > user > delete > handleUserDelete",
        `User not found: ${supabaseId}`
      );
      return null;
    }

    // 执行删除操作
    const deletedUsers = await db
      .delete(users)
      .where(eq(users.supabaseId, supabaseId))
      .returning();

    customLog(
      "api > admin > user > delete > handleUserDelete",
      `User deletion completed for: ${supabaseId}`
    );

    return deletedUsers.length > 0 ? deletedUsers[0] : null;
  } catch (error) {
    customLog(
      "api > admin > user > delete > handleUserDelete",
      `Error in user deletion: ${JSON.stringify(error)}`
    );
    throw error;
  }
};