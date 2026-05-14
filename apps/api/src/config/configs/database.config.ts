import { registerAs } from "@nestjs/config";
import { z } from "zod";

const schema = z.object({
  url: z.string().min(1).optional(),
  directUrl: z.string().min(1).optional(),
});

export type DatabaseConfig = z.infer<typeof schema>;

export const databaseConfig = registerAs("database", (): DatabaseConfig => {
  const config = schema.parse({
    url: process.env.DATABASE_URL || undefined,
    directUrl: process.env.DATABASE_DIRECT_URL || undefined,
  });

  if (process.env.NODE_ENV === "production" && !config.url) {
    throw new Error(
      "DATABASE_URL is required in production. " +
        "Set it in your deployment platform (Railway, Supabase, etc.).",
    );
  }

  return Object.defineProperty(config, "toJSON", {
    value: () => ({
      url: config.url ? "[REDACTED]" : undefined,
      directUrl: config.directUrl ? "[REDACTED]" : undefined,
    }),
    enumerable: false,
  });
});
