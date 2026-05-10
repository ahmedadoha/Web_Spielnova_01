import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // picsum.photos — used for game poster placeholders until real photos are provided.
      // To replace with real photos: upload to /public/ and update imageSrc in lib/games.ts.
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
