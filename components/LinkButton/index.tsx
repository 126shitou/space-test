"use client";
import { sendGTMEvent } from "@next/third-parties/google";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function LinkButton({
  GTMName,
  path,
  isHero = false,
  name,
}: {
  GTMName: string;
  path: string;
  isHero?: boolean;
  name: string;
}) {
  return (
    <div
      className={cn(
        "w-40 h-12 xl:w-44 2xl:w-48 relative bg-primary rounded-lg sm:rounded-xl   cursor-pointer mx-auto lg:mx-0",
        isHero && "m-0 w-32 h-10  xl:h-12 "
      )}
    >
      <Link
        href={path}
        className="w-full h-full flex items-center justify-center"
        onClick={() =>
          sendGTMEvent({
            event: "ToolSectionRedirect",
            toolSectionRedirect: GTMName,
          })
        }
      >
        <div
          className={cn(
            "text-center text-white text-base 2xl:text-lg font-semibold leading-normal px-1 xl:px-2 ",
            isHero && "text-xs  xl:text-base "
          )}
        >
          {name}
        </div>
      </Link>
    </div>
  );
}
