import { Search } from "lucide-react";
import Image from "next/image";
import CategoryGroup from "./CategoryGroup";

export default async function Blog() {
  return (
    <div className="max-w-[1440px]   mx-auto">
      <h1 className="text-zinc-800  text-6xl font-bold text-center leading-[72px]">
        Effect AI Blog
      </h1>
      <div className="flex items-center  mt-9 w-full h-14 rounded-4xl bg-zinc-100 outline-1 outline-offset-[-1px] outline-gray-200 px-12">
        <input
          className="size-full leading-9 focus-within:outline-none   text-base placeholder:text-neutral-600/80 "
          placeholder="Search any topic or articles"
        />
        <Search className="size-7 text-[#2b2b2b]" />
      </div>
      <CategoryGroup />
      <div className="mt-12 flex  border border-violet-600/20 rounded-2xl overflow-hidden">
        <div className="flex-1">
          <Image
            src="/tmp/a1.png"
            alt=""
            width={580}
            height={363}
            className="w-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col p-9 justify-between">
          <div>
            <span className="text-zinc-800 text-sm  font-normal leading-tight">
              Text to Image
            </span>
            <h1 className="text-zinc-800 text-3xl font-bold mt-4 ">
              14 Midjourney Alternatives for Pro AI Images and Videos [Free +
              Paid] | ImagineArt
            </h1>
          </div>
          <div className="flex text-sm items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/tmp/a1.png"
                alt=""
                width={500}
                height={500}
                className="rounded-full size-6"
              ></Image>
              <span>Saba Sohail</span>
            </div>
            <span className="text-neutral-600/60">August 29, 2025</span>
          </div>
        </div>
      </div>
      <BlogContent />
    </div>
  );
}

function BlogContent() {
  const blogData = [
    {
      id: 1,
      src: "/tmp/a1.png",
      title:
        "14 Midjourney Alternatives for Pro AI Images and Videos [Free + Paid] | ImagineArt",
      avatar: "/tmp/a1.png",
      author: "Saba Sohail",
      date: "August 29, 2025",
    },
    {
      id: 2,
      src: "/tmp/a1.png",
      title:
        "14 Midjourney Alternatives for Pro AI Images and Videos [Free + Paid] | ImagineArt",
      avatar: "/tmp/a1.png",
      author: "Saba Sohail",
      date: "August 29, 2025",
    },
    {
      id: 3,
      src: "/tmp/a1.png",
      title:
        "14 Midjourney Alternatives for Pro AI Images and Videos [Free + Paid] | ImagineArt",
      avatar: "/tmp/a1.png",
      author: "Saba Sohail",
      date: "August 29, 2025",
    },
    {
      id: 4,
      src: "/tmp/a1.png",
      title:
        "14 Midjourney Alternatives for Pro AI Images and Videos [Free + Paid] | ImagineArt",
      avatar: "/tmp/a1.png",
      author: "Saba Sohail",
      date: "August 29, 2025",
    },
    {
      id: 5,
      src: "/tmp/a1.png",
      title:
        "14 Midjourney Alternatives for Pro AI Images and Videos [Free + Paid] | ImagineArt",
      avatar: "/tmp/a1.png",
      author: "Saba Sohail",
      date: "August 29, 2025",
    },
  ];
  return (
    <div className="w-full mt-24 pb-12">
      <span className="text-zinc-800 text-4xl font-bold">Text to Image</span>
      <div className="grid grid-cols-3 gap-6 mt-9">
        {blogData.map((item) => (
          <div
            key={item.id}
            className="w-full  border border-violet-600/20 rounded-2xl overflow-hidden"
          >
            <Image
              src={item.src}
              alt=""
              width={580}
              height={363}
              className="w-full object-cover aspect-video"
            />

            <div className="p-4">
              <span className="text-zinc-800 text-base font-bold mt-4">
                {item.title}
              </span>
              <div className=" pt-7 flex text-sm items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/tmp/a1.png"
                    alt=""
                    width={500}
                    height={500}
                    className="rounded-full size-6"
                  ></Image>
                  <span>Saba Sohail</span>
                </div>
                <span className="text-neutral-600/60">August 29, 2025</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
