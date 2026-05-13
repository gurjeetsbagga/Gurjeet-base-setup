declare const process: { env: Record<string, string | undefined> };

import { resolveUrl } from "@auryn/config/env/urls";

/**
 * Centralized environment access for the mobile app.
 *
 * EXPO_PUBLIC_* vars are inlined by Metro at build time.
 * They must be read literally from process.env.
 */

export const env = {
  API_URL: resolveUrl(
    process.env.EXPO_PUBLIC_API_URL,
    "api",
    "EXPO_PUBLIC_API_URL",
    process.env.NODE_ENV,
  ),

  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME ?? "Auryn",

  IS_DEV: process.env.NODE_ENV === "development" || __DEV__,
} as const;

declare const __DEV__: boolean;
