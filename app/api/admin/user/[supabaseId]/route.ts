import { NextResponse } from "next/server";
import { customLog } from "@/lib/utils";
import { db } from "@/lib/db";
import { users, type User, type NewUser } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

type UpdateUserData = {
  name?: string;
  avatar?: string;
  email?: string;
  points?: number;
  subscriptionType?: "free" | "basic" | "pro";
  subscriptionsStartDate?: string;
  subscriptionsEndDate?: string;
  lastLogin?: string;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ supabaseId: string }> }
) {
  customLog("api > admin > users > PUT", "update user data");

  try {
    const { supabaseId } = await params;
    const body = await request.json();
    
    customLog(
      "api > admin > users > PUT",
      `Updating user: ${supabaseId}, data: ${JSON.stringify(body)}`
    );

    const updatedUser = await handleUserUpdate(supabaseId, body);
    
    if (updatedUser) {
      customLog(
        "api > admin > users > PUT",
        `User updated successfully: ${updatedUser.email}`
      );
      
      return NextResponse.json({
        success: true,
        data: null,
        message: "用户信息更新成功"
      });
    } else {
      customLog("api > admin > users > PUT", "User not found for update");
      
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
      "api > admin > users > PUT",
      `Error updating user: ${JSON.stringify(error)}`
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

const handleUserUpdate = async (
  supabaseId: string,
  updateData: UpdateUserData
): Promise<User | null> => {
  try {
    // 验证用户是否存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (existingUser.length === 0) {
      customLog(
        "api > admin > users > PUT > handleUserUpdate",
        `User not found: ${supabaseId}`
      );
      return null;
    }

    // 构建更新数据
    const toDateOrNull = (value?: string) => {
      if (!value) return null;
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    };

    const updateFields: Partial<NewUser> = {
      updatedAt: new Date(),
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.avatar !== undefined && { avatar: updateData.avatar }),
      ...(updateData.email !== undefined && { email: updateData.email }),
      ...(updateData.points !== undefined && { points: updateData.points }),
      ...(updateData.subscriptionType !== undefined && {
        subscriptionType: updateData.subscriptionType,
      }),
      ...(updateData.subscriptionsStartDate !== undefined && {
        subscriptionsStartDate: toDateOrNull(updateData.subscriptionsStartDate),
      }),
      ...(updateData.subscriptionsEndDate !== undefined && {
        subscriptionsEndDate: toDateOrNull(updateData.subscriptionsEndDate),
      }),
      ...(updateData.lastLogin !== undefined && {
        lastLogin: toDateOrNull(updateData.lastLogin),
      }),
    };

    customLog(
      "api > admin > users > PUT > handleUserUpdate",
      `Update fields: ${JSON.stringify(Object.keys(updateFields))}`
    );

    // 执行更新操作
    const updatedUsers = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.supabaseId, supabaseId))
      .returning();

    customLog(
      "api > admin > users > PUT > handleUserUpdate",
      `User update completed for: ${supabaseId}`
    );

    return updatedUsers.length > 0 ? updatedUsers[0] : null;
  } catch (error) {
    customLog(
      "api > admin > users > PUT > handleUserUpdate",
      `Error in user update: ${JSON.stringify(error)}`
    );
    throw error;
  }
};