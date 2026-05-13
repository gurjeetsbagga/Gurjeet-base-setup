import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./supabase.config";

/**
 * Thin wrapper around the Supabase JS client.
 *
 * Provides two clients:
 * - `admin`  — service-role client for server-side operations (bypasses RLS)
 * - `client` — anon-key client for operations that respect RLS
 *
 * Both are initialized lazily. If Supabase is not configured
 * (env vars missing), methods log a warning and return null.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  private adminClient: SupabaseClient | null = null;
  private anonClient: SupabaseClient | null = null;

  onModuleInit() {
    if (!supabaseConfig.enabled) {
      this.logger.warn(
        "Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.",
      );
      return;
    }

    this.adminClient = createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    if (supabaseConfig.anonKey) {
      this.anonClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }

    this.logger.log("Supabase clients initialized");
  }

  /** Service-role client — bypasses RLS. Use for server-side admin operations. */
  get admin(): SupabaseClient | null {
    return this.adminClient;
  }

  /** Anon-key client — respects RLS. Use when acting on behalf of a user. */
  get client(): SupabaseClient | null {
    return this.anonClient;
  }

  /** Whether Supabase is configured and ready. */
  get isEnabled(): boolean {
    return supabaseConfig.enabled && this.adminClient !== null;
  }

  /**
   * Create a client scoped to a specific user's JWT.
   * Useful for making requests that respect RLS as a particular user.
   */
  forUser(accessToken: string): SupabaseClient | null {
    if (!supabaseConfig.enabled || !supabaseConfig.anonKey) return null;

    return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
