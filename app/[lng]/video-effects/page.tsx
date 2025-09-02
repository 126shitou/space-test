import Link from "next/link";
import WaterfallTab from "./WaterFallTab";

export default function VideoEffects() {
  return (
    <div className="h-full px-4 sm:px-6 lg:px-8">
      <section className="w-full flex justify-center">
        <h1 className="my-4 sm:my-6 w-full max-w-[494px] justify-center text-3xl sm:text-4xl lg:text-5xl font-semibold bg-gradient-to-r from-[#8A38FC] to-[#DDD2EC] bg-clip-text text-transparent text-center px-4">
          AI video effects
        </h1>
      </section>
      <section className="w-full">
        <div className="w-full bg-black rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-around items-center gap-6 lg:gap-8 xl:gap-12">
            {[
              {
                poster:
                  "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/3.png",
                src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/banner-1.mp4",
                desc: "Romantic kissing effects",
                href: "void 0",
              },
              {
                poster:
                  "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/8.png",
                src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/banner-2.mp4",
                desc: "The whole body is covered with liquid metal",
                href: "void 0",
              },
              {
                poster:
                  "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/1.png",
                src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/banner-3.mp4",
                desc: "Colorful flowers burst out of his mouth",
                href: "void 0",
              },
            ].map((item) => (
              <div
                className="w-full lg:flex-1 flex-shrink-0 z-20 relative"
                key={item.src}
              >
                <video
                  className="w-full aspect-[16/9] rounded-xl object-cover"
                  autoPlay
                  loop
                  muted
                  poster={item.poster}
                  preload="metadata"
                  src={item.src}
                />
                <div className="absolute bottom-8 sm:bottom-8 lg:bottom-10 left-0 z-30 w-full px-3 sm:px-4 lg:pr-0 lg:pl-3 xl:px-5">
                  <div className="flex flex-col items-start md:items-center sm:flex-row h-auto sm:h-12 lg:h-16 justify-between w-full gap-2 sm:gap-0 flex-wrap">
                    <span className="text-white text-base sm:text-lg xl:text-xl 2xl:text-2xl font-semibold max-w-96">
                      {item.desc}
                    </span>
                    <Link
                      href={item.href}
                      className="text-white text-sm sm:text-base font-semibold w-24 sm:w-28 lg:w-32 h-9 sm:h-10 lg:h-11 rounded-4xl bg-[url('/ColorBorder.svg')] bg-cover bg-center bg-no-repeat text-center flex items-center justify-center touch-manipulation"
                    >
                      Generate
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
        <WaterfallTab />
      </section>
    </div>
  );
}
