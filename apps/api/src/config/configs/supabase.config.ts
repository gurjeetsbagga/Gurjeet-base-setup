import { registerAs } from "@nestjs/config";
import { z } from "zod";

const schema = z.object({
  url: z.string().min(1).optional(),
  anonKey: z.string().min(1).optional(),
  serviceRoleKey: z.string().min(1).optional(),
  jwtSecret: z.string().min(1).optional(),
  enabled: z.boolean(),
});

export type SupabaseConfig = z.infer<typeof schema>;

export const supabaseConfig = registerAs("supabase", (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL || undefined;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;

  const config = schema.parse({
    url,
    anonKey: process.env.SUPABASE_ANON_KEY || undefined,
    serviceRoleKey,
    jwtSecret: process.env.SUPABASE_JWT_SECRET || undefined,
    enabled: Boolean(url && serviceRoleKey),
  });

  return Object.defineProperty(config, "toJSON", {
    value: () => ({
      url: config.url,
      enabled: config.enabled,
      anonKey: config.anonKey ? "[REDACTED]" : undefined,
      serviceRoleKey: config.serviceRoleKey ? "[REDACTED]" : undefined,
      jwtSecret: config.jwtSecret ? "[REDACTED]" : undefined,
    }),
    enumerable: false,
  });
});
