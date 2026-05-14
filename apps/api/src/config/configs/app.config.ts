import { registerAs } from "@nestjs/config";
import { z } from "zod";
import { SERVICE_PORTS, localUrl, normalizeUrl } from "@auryn/config/env/urls";

const schema = z.object({
  nodeEnv: z.enum(["development", "staging", "production"]),
  port: z.number().int().positive(),
  host: z.string().min(1),
  logLevel: z.enum(["error", "warn", "log", "debug", "verbose"]),
  corsOrigins: z.array(z.string().min(1)).min(1),
  isDev: z.boolean(),
  isStaging: z.boolean(),
  isProduction: z.boolean(),
  apiUrl: z.string().optional(),
  webUrl: z.string().optional(),
  adminUrl: z.string().optional(),
});

export type AppConfig = z.infer<typeof schema>;

export const appConfig = registerAs("app", (): AppConfig => {
  const nodeEnv = (process.env.NODE_ENV as AppConfig["nodeEnv"]) ?? "development";
  const isDev = nodeEnv === "development";
  const isProduction = nodeEnv === "production";

  return schema.parse({
    nodeEnv,
    port: parseInt(process.env.PORT ?? process.env.API_PORT ?? String(SERVICE_PORTS.api), 10),
    host: process.env.API_HOST ?? "0.0.0.0",
    logLevel: process.env.LOG_LEVEL ?? (isDev ? "debug" : "log"),
    corsOrigins: resolveCorsOrigins(isDev),
    isDev,
    isStaging: nodeEnv === "staging",
    isProduction,
    apiUrl: resolveServiceUrl(process.env.API_URL, process.env.RAILWAY_PUBLIC_DOMAIN, "api", isDev),
    webUrl: resolveServiceUrl(process.env.WEB_URL, undefined, "web", isDev),
    adminUrl: resolveServiceUrl(process.env.ADMIN_URL, undefined, "admin", isDev),
  });
});

function resolveCorsOrigins(isDev: boolean): string[] {
  const raw = process.env.API_CORS_ORIGINS;
  if (raw) {
    return raw
      .split(",")
      .map((o) => normalizeUrl(o.trim()))
      .filter(Boolean);
  }

  if (isDev) {
    return [localUrl("web"), localUrl("admin")];
  }

  throw new Error(
    "API_CORS_ORIGINS is required in production. " +
      "Set to a comma-separated list of allowed origins.",
  );
}

/**
 * Resolves a service URL from explicit env, Railway domain, or localhost fallback.
 * Railway injects RAILWAY_PUBLIC_DOMAIN for the deployed service.
 */
function resolveServiceUrl(
  explicitUrl: string | undefined,
  railwayDomain: string | undefined,
  service: "api" | "web" | "admin",
  isDev: boolean,
): string | undefined {
  if (explicitUrl) return normalizeUrl(explicitUrl);
  if (railwayDomain) return `https://${railwayDomain}`;
  if (isDev) return localUrl(service);
  return undefined;
}
