"use client";
export default function CategoryGroup() {
  return (
    <div className="flex items-center gap-6 mt-12 w-full justify-center">
      {[
        "Image Generation",
        "Video Generation",
        "Audio Generation",
        "Text Generation",
        "Code Generation",
        "Codes Generation",
      ].map((item) => (
        <div
          className="w-36   px-2 leading-10  text-sm  text-center  border border-zinc-800 text-zinc-800 rounded-4xl cursor-pointer"
          key={item}
          onClick={() => {
            console.log(item);
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
