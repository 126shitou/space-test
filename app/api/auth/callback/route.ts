import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/db/supabase/server";
import { customLog } from "@/lib/utils";
import { createDb } from "@/lib/db";
import { users, type User, type NewUser } from "@/lib/db/schema/user";
import { eq } from "drizzle-orm";

type LoginType = "google" | "github";

export async function GET(request: Request) {
  customLog("api > auth > callback", "exchange code");

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 处理用户数据，将Supabase用户信息同步到数据库
      const loginType: LoginType =
        (data?.user?.app_metadata?.provider as LoginType) || "";

      let user = null;
      console.log("loginType", loginType);

      switch (loginType) {
        case "github":
          user = await handleGithubData(data);
          break;
        case "google":
          user = await handleGoogleData(data);
          break;

        default:
          break;
      }

      if (user) {
        customLog(
          "api > auth > callback",
          `User data processed successfully for: ${user.email}`
        );
      } else {
        customLog("api > auth > callback", "Failed to process user data");
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

const handleGithubData = async (data: any): Promise<User | null> => {
  try {
    if (!data?.user) {
      customLog("api > auth > callback > handleUserData", "No user data found");
      return null;
    }

    const supabaseUser = data.user;
    const userMetadata = supabaseUser.user_metadata || {};

    // 构造符合数据库schema的用户对象
    const userData: NewUser = {
      supabaseId: supabaseUser.id,
      name:
        userMetadata.user_name ||
        userMetadata.preferred_username ||
        userMetadata.name ||
        supabaseUser.email?.split("@")[0] ||
        "Unknown User",
      avatar: userMetadata.avatar_url || null,
      email: supabaseUser.email,
      points: 10, // 默认积分
      subscriptionType: "free", // 默认订阅类型
      lastLogin: new Date(),
    };
    const db = createDb();

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseUser.id))
      .limit(1);

    if (existingUser.length > 0) {
      // 用户已存在，更新最后登录时间
      const updatedUser = await db
        .update(users)
        .set({
          lastLogin: new Date(),
          updatedAt: new Date(),
          // 可选：更新头像和用户名（如果有变化）
          avatar: userMetadata.avatar_url || existingUser[0].avatar,
          name:
            userMetadata.user_name ||
            userMetadata.preferred_username ||
            existingUser[0].name,
        })
        .where(eq(users.supabaseId, supabaseUser.id))
        .returning();

      customLog(
        "api > auth > callback > handleUserData",
        `Updated existing user: ${supabaseUser.email}`
      );
      return updatedUser[0];
    } else {
      // 新用户，插入数据库
      const newUser = await db.insert(users).values(userData).returning();

      customLog(
        "api > auth > callback > handleUserData",
        `Created new user: ${supabaseUser.email}`
      );
      return newUser[0];
    }
  } catch (error) {
    customLog(
      "api > auth > callback > handleGithubData",
      `Error handling user data: ${JSON.stringify(error)}`
    );
    return null;
  }
};

// 处理Google登录数据
const handleGoogleData = async (data: any): Promise<User | null> => {
  try {
    if (!data?.user) {
      customLog(
        "api > auth > callback > handleGoogleData",
        "No user data found"
      );
      return null;
    }

    const supabaseUser = data.user;
    const userMetadata = supabaseUser.user_metadata || {};

    // 构造符合数据库schema的用户对象
    // Google返回的数据结构：name, picture, email等字段
    const userData: NewUser = {
      supabaseId: supabaseUser.id,
      name:
        userMetadata.full_name ||
        userMetadata.name ||
        supabaseUser.email?.split("@")[0] ||
        "Unknown User",
      avatar: userMetadata.picture || userMetadata.avatar_url || null,
      email: supabaseUser.email,
      points: 10, // 默认积分
      subscriptionType: "free", // 默认订阅类型
      lastLogin: new Date(),
    };
    const db = createDb();

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseUser.id))
      .limit(1);

    if (existingUser.length > 0) {
      // 用户已存在，更新最后登录时间
      const updatedUser = await db
        .update(users)
        .set({
          lastLogin: new Date(),
          updatedAt: new Date(),
          // 可选：更新头像和用户名（如果有变化）
          avatar:
            userMetadata.picture ||
            userMetadata.avatar_url ||
            existingUser[0].avatar,
          name:
            userMetadata.full_name || userMetadata.name || existingUser[0].name,
        })
        .where(eq(users.supabaseId, supabaseUser.id))
        .returning();

      customLog(
        "api > auth > callback > handleGoogleData",
        `Updated existing user: ${supabaseUser.email}`
      );
      return updatedUser[0];
    } else {
      // 新用户，插入数据库
      const newUser = await db.insert(users).values(userData).returning();

      customLog(
        "api > auth > callback > handleGoogleData",
        `Created new user: ${supabaseUser.email}`
      );
      return newUser[0];
    }
  } catch (error) {
    customLog(
      "api > auth > callback > handleGoogleData",
      `Error handling user data: ${JSON.stringify(error)}`
    );
    return null;
  }
};
