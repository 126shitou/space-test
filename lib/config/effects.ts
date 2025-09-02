import { Parameter } from "@/types/paramaters";
export type VideoEffect = {
  id: string;
  title: string;
  style: string;
  videoUrl: string;
  imageUrl: string;
  videos: {
    id: number;
    src: string;
    poster: string;
  }[];
  parameters: Parameter[];
};

export const videoEffectsData: VideoEffect[] = [
  {
    id: "animals-caught-on-camera",
    title: "animals-caught-on-camera",
    style: "aspect-[21/9] w-full",
    videoUrl:
      "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-1.mp4",
    imageUrl:
      "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-1.png",
    videos: [
      {
        id: 1,
        src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-1.mp4",
        poster:
          "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-1.png",
      },
      {
        id: 2,
        src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-2.mp4",
        poster:
          "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-2.png",
      },
      {
        id: 3,
        src: "https://res.cloudinary.com/dsciihnpa/video/upload/f_auto%2Cc_limit/ai-video-carousel-3.mp4",
        poster:
          "https://res.cloudinary.com/dsciihnpa/image/upload/f_auto%2Cc_limit/ai-video-thumb-carousel-3.png",
      },
    ],
    parameters: [
      // {
      //   id: "image",
      //   type: "image",
      //   name: "图片上传",
      //   required: true,
      // },
      {
        id: "doubleImage",
        type: "doubleImage",
        name: "双图片上传",
        required: true,
        maxSize: 10,
        acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
      },
    ],
  },
  {
    id: "ai-kiss",
    title: "ai-kiss",
    style: "aspect-[21/9] h-full",
    videoUrl:
      "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/viedo/A.mp4",
    imageUrl:
      "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/poster/N.png",
    videos: [
      {
        id: 1,
        src: "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/viedo/H.mp4",
        poster:
          "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/poster/G.png",
      },
      {
        id: 2,
        src: "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/viedo/G.mp4",
        poster:
          "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/poster/B.png",
      },
      {
        id: 3,
        src: "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/viedo/B.mp4",
        poster:
          "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/kiss/poster/O.png",
      },
    ],
    parameters: [
      {
        id: "image",
        type: "image",
        name: "图片上传",
        required: true,
      },
    ],
  },
  {
    id: "squish-effect",
    title: "squish-effect",
    style: "aspect-[21/9] h-full",
    videoUrl:
      "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/video/B.mp4",
    imageUrl:
      "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/poster/E1.png",
    videos: [
      {
        id: 1,
        src: "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/video/F.mp4",
        poster:
          "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/poster/F1.png",
      },
      {
        id: 2,
        src: "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/video/D.mp4",
        poster:
          "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/poster/G1.png",
      },
      {
        id: 3,
        src: "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/video/A.mp4",
        poster:
          "https://pub-d971bff5576c4337bba795092aa63092.r2.dev/VideoEffects/Squish/poster/I1.png",
      },
    ],
    parameters: [
      {
        id: "image",
        type: "image",
        name: "图片上传",
        required: true,
      },
    ],
  },
];
