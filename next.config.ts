import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.elkjop.com",
        pathname: "/assets/**",
      },
    ],
    minimumCacheTTL: 86400, // TTL for one day
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
