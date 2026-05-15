import { resolveUrl } from "@auryn/config/env/urls";

/**
 * Centralized environment access for the web app.
 *
 * NEXT_PUBLIC_* vars must be read literally — Next.js replaces them
 * at build time. The shared `resolveUrl` handles normalization and
 * enforces that production runtime has explicit values.
 */

/** Next.js sets NODE_ENV=production during `next build`; use dev fallbacks then. */
function resolveEnvMode(): string | undefined {
  if (process.env.NEXT_PHASE === "phase-production-build") return "development";
  return process.env.NODE_ENV;
}

export const env = {
  API_URL: resolveUrl(
    process.env.NEXT_PUBLIC_API_URL,
    "api",
    "NEXT_PUBLIC_API_URL",
    resolveEnvMode(),
  ),

  APP_URL: resolveUrl(
    process.env.NEXT_PUBLIC_APP_URL,
    "web",
    "NEXT_PUBLIC_APP_URL",
    resolveEnvMode(),
  ),

  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Auryn",

  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
} as const;
