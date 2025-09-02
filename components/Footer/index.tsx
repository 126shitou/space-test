import Link from "next/link";
import Image from "next/image";
import { Github } from "lucide-react";
import LanguageSwitch from "@/components/LanguageSwitch";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white">
      {/* 主要内容区域 */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-between px-4 md:px-10 py-6 md:py-16 gap-6 lg:gap-0">
        {/* 左侧：Logo、邮箱、社交媒体图标和语言选择器 */}
        <div className="flex flex-col w-full lg:w-auto items-center lg:items-start">
          <div className="mb-4 md:mb-8 text-center lg:text-left">
            <Image
              src="https://cdn.dancf.com/fe-assets/20231212/685bf664f43ec5e108f87102aa370aa0.svg"
              alt="insMind logo"
              width={120}
              height={30}
              className="mb-3 w-24 h-6 md:w-28 md:h-7 lg:w-32 lg:h-8 mx-auto lg:mx-0"
            />

            <p className="mb-4 md:mb-8 text-sm font-normal text-t-m">
              E-mail: support@insmind.com
            </p>
            {/* 社交媒体图标 */}
            <div className="flex space-x-4 justify-center lg:justify-start">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github />
              </Link>
            </div>
          </div>

          {/* 语言选择器 */}
          <div className="flex justify-center lg:justify-start w-full">
            <LanguageSwitch defaultValue="en" />
          </div>
        </div>

        {/* 右侧：三列链接菜单 */}
        <div className="flex flex-col md:flex-row w-full lg:w-auto gap-6 md:gap-16 md:justify-center items-center lg:items-start">
          <nav className="lg:mr-20 text-center lg:text-left">
            <div className="mb-3 md:mb-5 text-base font-medium text-white">
              Free Tools
            </div>
            <div className="space-y-2 md:space-y-5 flex flex-col items-center lg:items-start">
              {[
                {
                  label: "Privacy Policy1",
                  href: "/",
                },
                {
                  label: "Privacy Policy2",
                  href: "/",
                },
                {
                  label: "Privacy Policy3",
                  href: "/",
                },
                {
                  label: "Privacy Policy4",
                  href: "/",
                },
              ].map((item) => {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-normal text-t-m hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <nav className="lg:mr-20 text-center lg:text-left">
            <div className="mb-3 md:mb-5 text-base font-medium text-white">
              Resources
            </div>
            <div className="space-y-2 md:space-y-5 flex flex-col items-center lg:items-start">
              {[
                {
                  label: "Blogs",
                  href: "/",
                },
              ].map((item) => {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-normal text-t-m hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
          <nav className="lg:mr-20 text-center lg:text-left">
            <div className="mb-3 md:mb-5 text-base font-medium text-white">
              Support
            </div>
            <div className="space-y-2 md:space-y-5 flex flex-col items-center lg:items-start">
              {[
                {
                  label: "Privacy Policy1",
                  href: "/",
                },
                {
                  label: "Privacy Policy2",
                  href: "/",
                },
                {
                  label: "Privacy Policy3",
                  href: "/",
                },
                {
                  label: "Privacy Policy4",
                  href: "/",
                },
              ].map((item) => {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-normal text-t-m hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="border-t border-gray-800 px-4 md:px-16 py-4">
        <div className="text-xs text-gray-400 text-center md:text-left">
          ©Copyright 2025 insMind-All rights reserved.
        </div>
      </div>
    </footer>
  );
}
