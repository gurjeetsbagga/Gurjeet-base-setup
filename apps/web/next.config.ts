import type { NextConfig } from "next";

const apiPort = process.env.API_PORT || "4000";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://localhost:${apiPort}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  transpilePackages: ["@auryn/types", "@auryn/utils", "@auryn/config"],

  typedRoutes: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
