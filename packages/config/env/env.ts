/**
 * Shared environment variable definitions.
 *
 * Each app imports the slices it needs and validates at startup.
 * This file is the single source of truth for variable names and
 * defaults — keep it in sync with the root .env.example.
 *
 * Usage (when Zod is available in a consuming app):
 *
 *   import { z } from "zod";
 *   import { globalEnv, apiEnv, databaseEnv } from "@auryn/config/env/env";
 *
 *   const schema = z.object({ ...globalEnv, ...apiEnv, ...databaseEnv });
 *   export const env = schema.parse(process.env);
 */

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

type EnvSlice = Record<string, { required: boolean; default?: string }>;

function defineEnv<T extends EnvSlice>(slice: T): T {
  return slice;
}

/* ------------------------------------------------------------------ */
/*  Global                                                             */
/* ------------------------------------------------------------------ */

export const globalEnv = defineEnv({
  NODE_ENV: { required: true, default: "development" },
  LOG_LEVEL: { required: false, default: "debug" },
});

/* ------------------------------------------------------------------ */
/*  API  (apps/api)                                                    */
/* ------------------------------------------------------------------ */

export const apiEnv = defineEnv({
  API_PORT: { required: false, default: "4000" },
  API_HOST: { required: false, default: "0.0.0.0" },
  API_CORS_ORIGINS: { required: false, default: "http://localhost:3000,http://localhost:3100" },
  API_JWT_SECRET: { required: true },
  API_JWT_EXPIRES_IN: { required: false, default: "15m" },
  API_JWT_REFRESH_EXPIRES_IN: { required: false, default: "7d" },
  API_THROTTLE_TTL: { required: false, default: "60" },
  API_THROTTLE_LIMIT: { required: false, default: "100" },
});

/* ------------------------------------------------------------------ */
/*  Web  (apps/web)                                                    */
/* ------------------------------------------------------------------ */

export const webEnv = defineEnv({
  WEB_PORT: { required: false, default: "3000" },
  NEXT_PUBLIC_APP_NAME: { required: false, default: "Auryn" },
  NEXT_PUBLIC_APP_URL: { required: false },
  NEXT_PUBLIC_API_URL: { required: true },
});

/* ------------------------------------------------------------------ */
/*  Admin  (apps/admin)                                                */
/* ------------------------------------------------------------------ */

export const adminEnv = defineEnv({
  ADMIN_PORT: { required: false, default: "3100" },
  NEXT_PUBLIC_ADMIN_URL: { required: false },
  NEXT_PUBLIC_API_URL: { required: true },
});

/* ------------------------------------------------------------------ */
/*  Mobile  (apps/mobile)                                              */
/* ------------------------------------------------------------------ */

export const mobileEnv = defineEnv({
  EXPO_PUBLIC_APP_NAME: { required: false, default: "Auryn" },
  EXPO_PUBLIC_API_URL: { required: true },
  EXPO_PUBLIC_APP_URL: { required: false },
});

/* ------------------------------------------------------------------ */
/*  Database                                                           */
/* ------------------------------------------------------------------ */

export const databaseEnv = defineEnv({
  DATABASE_URL: { required: true },
  DATABASE_DIRECT_URL: { required: false },
  DATABASE_SHADOW_URL: { required: false },
});

/* ------------------------------------------------------------------ */
/*  Supabase                                                           */
/* ------------------------------------------------------------------ */

export const supabaseEnv = defineEnv({
  SUPABASE_URL: { required: false },
  SUPABASE_ANON_KEY: { required: false },
  SUPABASE_SERVICE_ROLE_KEY: { required: false },
  SUPABASE_JWT_SECRET: { required: false },
});

/* ------------------------------------------------------------------ */
/*  OpenAI                                                             */
/* ------------------------------------------------------------------ */

export const openaiEnv = defineEnv({
  OPENAI_API_KEY: { required: false },
  OPENAI_ORG_ID: { required: false },
  OPENAI_MODEL: { required: false, default: "gpt-4o" },
  OPENAI_EMBEDDING_MODEL: { required: false, default: "text-embedding-3-small" },
  OPENAI_MAX_TOKENS: { required: false, default: "4096" },
  OPENAI_TEMPERATURE: { required: false, default: "0.7" },
});

/* ------------------------------------------------------------------ */
/*  Redis                                                              */
/* ------------------------------------------------------------------ */

export const redisEnv = defineEnv({
  REDIS_URL: { required: false },
});

/* ------------------------------------------------------------------ */
/*  AWS                                                                */
/* ------------------------------------------------------------------ */

export const awsEnv = defineEnv({
  AWS_REGION: { required: false, default: "us-east-1" },
  AWS_ACCESS_KEY_ID: { required: false },
  AWS_SECRET_ACCESS_KEY: { required: false },
  AWS_S3_BUCKET: { required: false },
});
