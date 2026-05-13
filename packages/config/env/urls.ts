/**
 * Auryn URL topology — single source of truth for service addresses.
 *
 * Each app imports the port constants and helpers it needs.
 * Env vars are read literally in each app (required by Next.js
 * static replacement and Expo's Metro inlining), but the
 * fallback logic and normalization live here.
 */

/* ------------------------------------------------------------------ */
/*  Default development ports                                          */
/* ------------------------------------------------------------------ */

export const SERVICE_PORTS = {
  api: 4000,
  web: 3000,
  admin: 3100,
} as const;

export type ServiceName = keyof typeof SERVICE_PORTS;

/* ------------------------------------------------------------------ */
/*  URL helpers                                                        */
/* ------------------------------------------------------------------ */

/** Strips trailing slashes so callers can always append `/path`. */
export function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Returns `http://localhost:{port}` for a known service. */
export function localUrl(service: ServiceName): string {
  return `http://localhost:${SERVICE_PORTS[service]}`;
}

/**
 * Resolve a URL from an env value.
 *
 * - If the value is set, normalize and return it.
 * - In development, fall back to `http://localhost:{port}`.
 * - In any other environment, throw — the URL must be configured.
 */
export function resolveUrl(
  value: string | undefined,
  service: ServiceName,
  envVarName: string,
  nodeEnv: string | undefined,
): string {
  if (value) return normalizeUrl(value);

  if (!nodeEnv || nodeEnv === "development") {
    return localUrl(service);
  }

  throw new Error(
    `${envVarName} is required in "${nodeEnv}" environment. ` +
      `Set it in your deployment platform (Vercel / Railway / .env).`,
  );
}

/* ------------------------------------------------------------------ */
/*  Env-var name registry                                              */
/* ------------------------------------------------------------------ */

export const ENV_KEYS = {
  web: {
    apiUrl: "NEXT_PUBLIC_API_URL",
    appUrl: "NEXT_PUBLIC_APP_URL",
    appName: "NEXT_PUBLIC_APP_NAME",
  },
  admin: {
    apiUrl: "NEXT_PUBLIC_API_URL",
    appUrl: "NEXT_PUBLIC_ADMIN_URL",
  },
  mobile: {
    apiUrl: "EXPO_PUBLIC_API_URL",
    appName: "EXPO_PUBLIC_APP_NAME",
  },
  api: {
    port: "API_PORT",
    host: "API_HOST",
    corsOrigins: "API_CORS_ORIGINS",
  },
} as const;
