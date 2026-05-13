/**
 * External service integrations.
 *
 * Each integration gets its own directory:
 *   integrations/supabase/       — auth, storage, Postgres pooling
 *   integrations/openai/         — AI model access (planned)
 *   integrations/physicianos-client/ — PhysicianOS API client (planned)
 *
 * Keep integration clients thin — they wrap an external SDK
 * or HTTP call and expose a typed interface consumed by modules.
 */

export { SupabaseModule, SupabaseService, supabaseConfig } from "./supabase";
export type { SupabaseConfig } from "./supabase";
