import { Logger } from "@nestjs/common";

const logger = new Logger("SecretValidation");

/**
 * Server-only secret variable names.
 *
 * These must NEVER be prefixed with NEXT_PUBLIC_ or EXPO_PUBLIC_
 * in any environment. If such a prefixed version exists, it means
 * secrets are leaking to client bundles.
 */
const SERVER_ONLY_SECRETS = [
  "OPENAI_API_KEY",
  "OPENAI_ORG_ID",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "API_JWT_SECRET",
  "DATABASE_URL",
  "DATABASE_DIRECT_URL",
  "DATABASE_SHADOW_URL",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_ACCESS_KEY_ID",
  "REDIS_URL",
];

const CLIENT_PREFIXES = ["NEXT_PUBLIC_", "EXPO_PUBLIC_"];

/**
 * Validate that no server-only secrets are exposed via client-safe
 * environment variable prefixes.
 *
 * Call this once at application startup (in main.ts or a config module).
 * Throws in production; warns in development.
 */
export function validateSecretBoundaries(): void {
  const violations: string[] = [];

  for (const secret of SERVER_ONLY_SECRETS) {
    for (const prefix of CLIENT_PREFIXES) {
      const publicKey = `${prefix}${secret}`;
      if (process.env[publicKey] !== undefined) {
        violations.push(
          `${publicKey} is set — "${secret}" is a server-only secret ` +
            `and must NEVER be exposed via ${prefix} prefix`,
        );
      }
    }
  }

  if (violations.length === 0) {
    logger.log("Secret boundary validation passed — no client exposure detected");
    return;
  }

  const message =
    `SECRET BOUNDARY VIOLATION — ${violations.length} server-only secret(s) ` +
    `found with client-safe prefixes:\n` +
    violations.map((v) => `  • ${v}`).join("\n");

  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

  if (isProduction) {
    logger.error(message);
    throw new Error(
      "Application startup blocked: server secrets exposed to client bundles. " +
        "Remove NEXT_PUBLIC_ / EXPO_PUBLIC_ prefixed versions of secret variables.",
    );
  }

  logger.warn(message);
}

/**
 * Returns a safe representation of the current OpenAI config
 * for admin dashboards and health endpoints — never includes secrets.
 */
export function safeOpenAiStatus(): {
  enabled: boolean;
  model: string;
  keyConfigured: boolean;
  orgConfigured: boolean;
} {
  return {
    enabled: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    keyConfigured: Boolean(process.env.OPENAI_API_KEY),
    orgConfigured: Boolean(process.env.OPENAI_ORG_ID),
  };
}
