import { SERVICE_PORTS, localUrl, normalizeUrl } from "@auryn/config/env/urls";

/**
 * Centralized environment resolution for the API.
 *
 * Unlike client apps, the API reads process.env at runtime
 * (no build-time inlining), so dynamic access is fine.
 */

export const apiEnvConfig = {
  port: parseInt(process.env.API_PORT ?? String(SERVICE_PORTS.api), 10),
  host: process.env.API_HOST ?? "0.0.0.0",

  corsOrigins: resolveCorsOrigins(),

  isDev: process.env.NODE_ENV !== "production",

  supabase: {
    url: process.env.SUPABASE_URL ?? "",
    anonKey: process.env.SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    jwtSecret: process.env.SUPABASE_JWT_SECRET ?? "",
    enabled: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  },
} as const;

function resolveCorsOrigins(): string[] {
  const raw = process.env.API_CORS_ORIGINS;
  if (raw) {
    return raw.split(",").map((o) => normalizeUrl(o.trim()));
  }

  if (process.env.NODE_ENV !== "production") {
    return [localUrl("web"), localUrl("admin")];
  }

  throw new Error(
    "API_CORS_ORIGINS is required in production. " +
      "Set to a comma-separated list of allowed origins.",
  );
}
