"use client";
import dynamic from "next/dynamic";

import React, {
  createContext,
  use,
  useState,
  ReactNode,
  useCallback,
} from "react";

const LoginModal = dynamic(() => import("@/components/LoginModal"));

interface LoginContextType {
  showLogin: () => void;
  hideLogin: () => void;
  isLoginOpen: boolean;
}

const LoginDialogContext = createContext<LoginContextType | undefined>(
  undefined
);

export const useLogin = () => {
  const ctx = use(LoginDialogContext);
  if (!ctx) {
    throw new Error("useLogin must be used within LoginDialogProvider");
  }
  return ctx;
};

export const LoginDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const showLogin = useCallback(() => setIsLoginOpen(true), []);
  const hideLogin = useCallback(() => setIsLoginOpen(false), []);

  const contextValue = {
    showLogin,
    hideLogin,
    isLoginOpen,
  };

  return (
    <LoginDialogContext value={contextValue}>
      {children}
      {isLoginOpen && (
        <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      )}
    </LoginDialogContext>
  );
};
