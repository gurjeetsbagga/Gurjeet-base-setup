import { registerAs } from "@nestjs/config";
import path from "node:path";
import { z } from "zod";

const pinoLevelSchema = z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]);

export type PinoLogLevel = z.infer<typeof pinoLevelSchema>;

const schema = z.object({
  enabled: z.boolean(),
  level: pinoLevelSchema,
  pretty: z.boolean(),
  logAiRequests: z.boolean(),
  logAiResponses: z.boolean(),
  logDbQueries: z.boolean(),
  logHttpRequests: z.boolean(),
  logFileEnabled: z.boolean(),
  logRotationEnabled: z.boolean(),
  logDirectory: z.string(),
  logMaxFileSize: z.string(),
  logMaxFiles: z.number().int().positive(),
  logRetentionDays: z.number().int().positive(),
  auditDbPersistence: z.boolean(),
  nodeEnv: z.enum(["development", "staging", "production"]),
  isDev: z.boolean(),
  isProduction: z.boolean(),
  isStaging: z.boolean(),
});

export type LoggingConfig = z.infer<typeof schema>;

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveLevel(nodeEnv: LoggingConfig["nodeEnv"], enabled: boolean): PinoLogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw && pinoLevelSchema.safeParse(raw).success) {
    return pinoLevelSchema.parse(raw);
  }
  if (!enabled) return "error";
  if (nodeEnv === "production") return "error";
  if (nodeEnv === "staging") return "info";
  return "debug";
}

export const loggingConfig = registerAs("logging", (): LoggingConfig => {
  const nodeEnv = (process.env.NODE_ENV as LoggingConfig["nodeEnv"]) ?? "development";
  const isDev = nodeEnv === "development";
  const isProduction = nodeEnv === "production";
  const isStaging = nodeEnv === "staging";

  const enabledDefault = isDev || isStaging;
  const enabled = parseBool(process.env.LOGGING_ENABLED, enabledDefault);

  const prettyDefault = isDev;
  const pretty = parseBool(process.env.LOG_PRETTY, prettyDefault) && isDev;

  const logAiDefault = isDev && !isProduction;
  const logAiRequests = enabled && parseBool(process.env.LOG_AI_REQUESTS, logAiDefault);
  const logAiResponses = enabled && parseBool(process.env.LOG_AI_RESPONSES, logAiDefault);

  const logDbQueries = enabled && parseBool(process.env.LOG_DB_QUERIES, false);

  const logHttpDefault = !isProduction;
  const logHttpRequests = enabled && parseBool(process.env.LOG_HTTP_REQUESTS, logHttpDefault);

  const logFileDefault = isDev;
  const logFileEnabled =
    enabled && parseBool(process.env.LOG_FILE_ENABLED, logFileDefault) && !isProduction;

  const logRotationEnabled = parseBool(process.env.LOG_ROTATION_ENABLED, logFileEnabled);

  const logDirectory = path.resolve(process.env.LOG_DIRECTORY ?? path.join(process.cwd(), "logs"));

  return schema.parse({
    enabled,
    level: resolveLevel(nodeEnv, enabled),
    pretty,
    logAiRequests,
    logAiResponses,
    logDbQueries,
    logHttpRequests,
    logFileEnabled,
    logRotationEnabled,
    logDirectory,
    logMaxFileSize: process.env.LOG_MAX_FILE_SIZE ?? "10M",
    logMaxFiles: parsePositiveInt(process.env.LOG_MAX_FILES, 5),
    logRetentionDays: parsePositiveInt(process.env.LOG_RETENTION_DAYS, 14),
    auditDbPersistence: parseBool(process.env.AUDIT_DB_PERSISTENCE, !isProduction || isStaging),
    nodeEnv,
    isDev,
    isProduction,
    isStaging,
  });
});
