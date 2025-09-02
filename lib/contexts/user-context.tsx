"use client";

import React, {
  createContext,
  use,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { getUserInfo } from "@/service/user";
import { createClient } from "@/lib/db/supabase/client";
import { customError, customLog, customSuccess } from "../utils";
import type { User } from "@/lib/db/schema/user";

interface UserContextType {
  isLogin: boolean;
  user: User | null;
  logout: () => void;
  refreshUserInfo: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserInfo = () => {
  const ctx = use(UserContext);
  if (!ctx) {
    throw new Error("useUserInfo must be used within UserProvider");
  }
  return ctx;
};

export const UserProvider = ({
  children,
  initUser,
}: {
  children: ReactNode;
  initUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(initUser);

  const refreshUserInfo = useCallback(async () => {
    const res = await getUserInfo();
    customSuccess(
      "context > user-context > refreshUserInfo",
      `刷新用户信息成功，用户信息：${JSON.stringify(res.data)}`
    );
    if (res.success) {
      setUser(res.data);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      customLog("context > user-context > logout", "登出成功");

      if (error) {
        customError(
          "context > user-context > supabase-error",
          `退出登录失败：${JSON.stringify(error)}`
        );
        return;
      }

      // 清除本地用户状态
      setUser(null);
    } catch (error) {
      customError(
        "context > user-context > catch-error",
        `退出登录失败：${JSON.stringify(error)}`
      );
    }
  }, []);

  const contextValue = {
    user,
    isLogin: user !== null,
    logout,
    refreshUserInfo,
  };

  return <UserContext value={contextValue}>{children}</UserContext>;
};
