import { registerAs } from "@nestjs/config";
import { z } from "zod";

const schema = z.object({
  jwtSecret: z.string().min(1).optional(),
  jwtExpiresIn: z.string().min(1),
  jwtRefreshExpiresIn: z.string().min(1),
});

export type AuthConfig = z.infer<typeof schema>;

export const authConfig = registerAs("auth", (): AuthConfig => {
  const config = schema.parse({
    jwtSecret: process.env.API_JWT_SECRET || undefined,
    jwtExpiresIn: process.env.API_JWT_EXPIRES_IN ?? "15m",
    jwtRefreshExpiresIn: process.env.API_JWT_REFRESH_EXPIRES_IN ?? "7d",
  });

  if (process.env.NODE_ENV === "production" && !config.jwtSecret) {
    throw new Error(
      "API_JWT_SECRET is required in production. " +
        "Set a strong random secret in your deployment environment.",
    );
  }

  return Object.defineProperty(config, "toJSON", {
    value: () => ({
      jwtExpiresIn: config.jwtExpiresIn,
      jwtRefreshExpiresIn: config.jwtRefreshExpiresIn,
      jwtSecret: config.jwtSecret ? "[REDACTED]" : undefined,
    }),
    enumerable: false,
  });
});
