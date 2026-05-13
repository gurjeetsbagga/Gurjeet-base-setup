import { Global, Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";

/**
 * Global Supabase module — provides SupabaseService to all modules
 * without explicit imports. Initializes lazily based on env vars.
 */
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
