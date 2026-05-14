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
 *
 * Configuration for each integration lives in config/configs/
 * and is injected via NestJS ConfigModule (registerAs pattern).
 */

export { SupabaseModule, SupabaseService } from "./supabase";
