import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/web-app-manifest-192x192",
        destination: "/web-app-manifest-192x192.png",
      },
      {
        source: "/web-app-manifest-512x512",
        destination: "/web-app-manifest-512x512.png",
      },
    ];
  },
};

export default nextConfig;
