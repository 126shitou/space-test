"use client";

import * as React from "react";
import Link from "next/link";

import Image from "next/image";
import { useUserInfo } from "@/lib/contexts/user-context";
import { useLogin } from "@/lib/contexts/login-dialog-context";
import PointsDisplay from "./PointsDisplay";
import { useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { videoEffectsData } from "@/lib/config/effects";
import { ChevronRight } from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Header() {
  const { user, logout } = useUserInfo();
  const { showLogin } = useLogin();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogin = () => {
    showLogin();
    sendGTMEvent({
      event: "LoginIntention",
    });
  };

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  const AIToolsImage = [
    {
      id: 1,
      name: "AI Image Generator",
      href: "/ai-image-generator",
      image:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-image-hero_n31vdl.png",
    },
    {
      id: 2,
      name: "AI Hairstyle Generator",
      href: "/ai-hairstyle-generator",
      image:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-hairstyle-hero_iddee9.png",
    },
    {
      id: 3,
      name: "AI Cartoon Generator",
      href: "/ai-cartoon-generator",
      image:
        "https://res.cloudinary.com/dsciihnpa/image/upload/ai-cartoon-hero_gy0rle.png",
    },
  ];

  const AIToolsVideo = [
    {
      id: 1,
      name: "AI Video Generator",
      href: "/ai-video-generator",
      image:
        "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-introduce-1.png",
    },
  ];

  return (
    <div className="h-header">
      <header className="bg-b-p w-full fixed z-[999]">
        <div className="px-3 md:px-5 flex items-center justify-between h-header">
          <div className="flex items-center h-full">
            {/* TODO 修改title alt */}
            <Link href="/" title="insMind Logo">
              <Image
                src="/logo.svg"
                alt="insMind Logo"
                className="align-middle mr-4 md:mr-6 lg:mr-10"
                width={40}
                height={24}
              />
            </Link>
            <div className="hidden md:flex gap-4 lg:gap-6 xl:gap-10">
              <div className="flex items-center h-full relative group">
                <NavigationMenu viewport={false}>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm lg:text-base font-medium text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer">
                        AI Image
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white backdrop-blur-sm rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100 p-3">
                        <ul className="grid w-96 grid-rows-4">
                          {AIToolsImage.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={item.href}
                                key={item.name}
                                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-100 rounded-lg cursor-pointer border-gray-100 min-w-0"
                              >
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={40}
                                  height={30}
                                  className="md:w-[86px] md:h-[58px] rounded-lg flex-shrink-0"
                                />
                                <div className="font-medium text-xs md:text-sm ">
                                  {item.name}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm lg:text-base font-medium text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer">
                        AI Video
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white backdrop-blur-sm rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100 p-3">
                        <ul className="grid w-96 grid-rows-4">
                          {AIToolsVideo.map((item) => (
                            <li key={item.id} className="w-96">
                              <Link
                                href={item.href}
                                key={item.name}
                                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-100 rounded-lg cursor-pointer border-gray-100 min-w-0"
                              >
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={40}
                                  height={30}
                                  className="md:w-[86px] md:h-[58px] rounded-lg flex-shrink-0"
                                />
                                <div className="font-medium text-xs md:text-sm ">
                                  {item.name}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm lg:text-base font-medium text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer">
                        AI Effect
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white backdrop-blur-sm rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100 p-3">
                        <ul className="grid w-96 grid-rows-4">
                          {videoEffectsData.map((item) => (
                            <li key={item.id}>
                              <Link
                                href={`/${item.id}`}
                                key={item.id}
                                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-100 rounded-lg cursor-pointer border-gray-100 min-w-0"
                              >
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  width={40}
                                  height={30}
                                  className="md:w-[86px] md:h-[58px] rounded-lg flex-shrink-0"
                                />
                                <div className="font-medium text-xs md:text-sm ">
                                  {item.title}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link href="/video-effects" className="flex justify-center items-center gap-2 cursor-pointer text-primary">
                          <span className="text-sm">View All</span>
                          <ChevronRight size={16}/>
                        </Link>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm lg:text-base font-medium text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer">
                        Explore
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white backdrop-blur-sm rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100 p-3">
                        <ul className="grid w-52 grid-rows-2">
                          {[{ title: "Blog", href: "/blog" }].map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-100 rounded-lg cursor-pointer border-gray-100 min-w-0"
                              >
                                <div className="font-medium text-xs md:text-sm ">
                                  {item.title}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link
                        href="/affiliate-program"
                        className="text-sm lg:text-base font-medium text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer"
                      >
                        Affiliate Program
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-4">
            {user ? (
              <>
                {/* 积分显示区域 */}
                <PointsDisplay points={user.points || 0} />

                {/* 用户头像和信息 */}
                <HoverCard openDelay={100} closeDelay={100}>
                  <HoverCardTrigger className="w-9 h-9 md:w-11 md:h-11 flex items-center cursor-pointer group">
                    <Image
                      src={user.avatar || ""}
                      alt="user avatar"
                      className="align-middle rounded-lg border-2 border-gray-200 group-hover:border-primary transition-all duration-200 shadow-sm group-hover:shadow-md overflow-hidden"
                      width={40}
                      height={40}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent className="flex flex-col p-4 w-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                    {/* 用户信息头部 */}
                    <div className="flex items-center gap-3  ">
                      <Image
                        src={user.avatar || ""}
                        alt="user avatar"
                        className="align-middle rounded-lg border-2 border-gray-200 shadow-sm overflow-hidden"
                        height={36}
                        width={36}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 font-semibold text-sm mb-1 truncate">
                          {user.name}
                        </div>
                        <div className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                          ID: {user.supabaseId}
                        </div>
                      </div>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-px bg-gray-200 my-3"></div>

                    {[
                      {
                        name: "My Creation",
                      },
                      {
                        name: "Pricing",
                      },
                      {
                        name: "Contact Us",
                      },
                      {
                        name: "Profile",
                      },
                      {
                        name: "Account Setting",
                      },
                    ].map((item) => {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center gap-2 text-gray-600 hover:text-primary h-9 px-3 text-sm font-medium select-none cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200"
                        >
                          {item.name}
                        </div>
                      );
                    })}
                    <div className="h-px bg-gray-200 my-3"></div>

                    {/* 退出登录按钮 */}
                    <div
                      onClick={() => setShowLogoutDialog(true)}
                      className="flex items-center gap-2 text-gray-600 hover:text-primary  h-9 px-3 text-sm font-medium select-none cursor-pointer hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      Sign Out
                    </div>
                  </HoverCardContent>
                </HoverCard>

                {/* 退出登录确认对话框 - 移到HoverCard外部 */}
                <AlertDialog
                  open={showLogoutDialog}
                  onOpenChange={setShowLogoutDialog}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认退出登录</AlertDialogTitle>
                      <AlertDialogDescription>
                        您确定要退出登录吗？退出后您需要重新登录才能使用相关功能。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>
                        确认退出
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div
                className="bg-primary text-white  text-xs md:text-sm px-3 md:px-5 py-1 md:py-2 rounded-2xl select-none cursor-pointer"
                onClick={handleLogin}
              >
                Login
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
