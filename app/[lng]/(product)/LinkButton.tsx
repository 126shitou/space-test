"use client";
import { sendGTMEvent } from "@next/third-parties/google";
import Link from "next/link";
import {cn} from "@/lib/utils/cn";

export default function LinkButton({ GTMName,path,isHero = false,name }: { GTMName: string,path:string,isHero?:boolean,name:string }) {

  return (
    <div className={cn('w-full max-w-32 sm:max-w-40 md:max-w-48 h-8 sm:h-10 md:h-12 relative bg-primary rounded-lg sm:rounded-xl mt-3 sm:mt-4 md:mt-8 cursor-pointer mx-auto lg:mx-0',isHero && 'm-0')}>
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
        <div className="text-center text-white text-xs sm:text-sm md:text-base font-semibold leading-normal px-1 sm:px-2 md:px-4">
            {name}
        </div>
      </Link>
    </div>
  );
}
