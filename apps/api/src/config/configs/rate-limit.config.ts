import { registerAs } from "@nestjs/config";
import { z } from "zod";

/**
 * Rate limit tiers — each tier defines a TTL window (seconds) and
 * a request limit within that window.
 *
 * Tiers are loaded from environment variables with sensible defaults
 * for development. Production values should be set explicitly.
 *
 *   Tier        | Use case                      | Default
 *   ----------- | ----------------------------- | --------
 *   global      | Baseline for all endpoints    | 100/60s
 *   ai          | AI completion endpoints       | 20/60s
 *   auth        | Login, register, refresh      | 10/60s
 *   strict      | Password reset, OTP, etc.     | 5/60s
 */
const schema = z.object({
  globalTtl: z.number().int().positive(),
  globalLimit: z.number().int().positive(),

  aiTtl: z.number().int().positive(),
  aiLimit: z.number().int().positive(),

  authTtl: z.number().int().positive(),
  authLimit: z.number().int().positive(),

  strictTtl: z.number().int().positive(),
  strictLimit: z.number().int().positive(),
});

export type RateLimitConfig = z.infer<typeof schema>;

export const rateLimitConfig = registerAs("rateLimit", (): RateLimitConfig => {
  return schema.parse({
    globalTtl: parseInt(process.env.RATE_LIMIT_GLOBAL_TTL ?? "60", 10),
    globalLimit: parseInt(process.env.RATE_LIMIT_GLOBAL_LIMIT ?? "100", 10),

    aiTtl: parseInt(process.env.RATE_LIMIT_AI_TTL ?? "60", 10),
    aiLimit: parseInt(process.env.RATE_LIMIT_AI_LIMIT ?? "20", 10),

    authTtl: parseInt(process.env.RATE_LIMIT_AUTH_TTL ?? "60", 10),
    authLimit: parseInt(process.env.RATE_LIMIT_AUTH_LIMIT ?? "10", 10),

    strictTtl: parseInt(process.env.RATE_LIMIT_STRICT_TTL ?? "60", 10),
    strictLimit: parseInt(process.env.RATE_LIMIT_STRICT_LIMIT ?? "5", 10),
  });
});
