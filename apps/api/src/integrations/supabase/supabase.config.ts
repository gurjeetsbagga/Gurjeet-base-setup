/**
 * Supabase configuration — resolved from environment variables.
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when
 * Supabase integration is enabled. The service role key provides
 * full admin access and must NEVER be exposed to clients.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  jwtSecret: string;
  enabled: boolean;
}

export function resolveSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL ?? "";
  const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const jwtSecret = process.env.SUPABASE_JWT_SECRET ?? "";

  const enabled = Boolean(url && serviceRoleKey);

  return { url, anonKey, serviceRoleKey, jwtSecret, enabled };
}

export const supabaseConfig = resolveSupabaseConfig();
