import type { NextConfig } from "next";

const apiPort = process.env.API_PORT || "4000";
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || `http://localhost:${apiPort}`;

/**
 * Next.js validates rewrite destinations and rejects any URL that is not a
 * fully-qualified `http(s)://...`. Operators frequently paste deployment URLs
 * without the protocol (or with a trailing slash) into the dashboard, which
 * surfaces as a vague "Invalid rewrite found" build error. Normalize here so
 * the deploy keeps working with reasonable input.
 */
function normalizeApiUrl(raw: string): string {
  let url = raw.replace(/\s+/g, "");
  if (!url) return `http://localhost:${apiPort}`;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, "");
}

const apiUrl = normalizeApiUrl(rawApiUrl);

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
