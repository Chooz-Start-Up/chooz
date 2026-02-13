import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@chooz/shared", "@chooz/services"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
