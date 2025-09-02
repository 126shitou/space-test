import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export",
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "images.insmind.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    // formats: ["image/webp", "image/avif"],
  },

  // 屏蔽 Supabase realtime-js 相关的 webpack 警告
  webpack: (config, { isServer }) => {
    // 忽略特定的警告
    config.ignoreWarnings = [
      // 忽略 Supabase realtime-js 的动态依赖警告
      /Critical dependency: the request of a dependency is an expression/,
      // 忽略 websocket 相关的警告
      /node_modules\/@supabase\/realtime-js/,
      /node_modules\/websocket/,
      /node_modules\/bufferutil/,
      /node_modules\/utf-8-validate/,
    ];

    return config;
  },
};

export default nextConfig;
