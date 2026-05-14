import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../../config/configs/supabase.config";

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

  constructor(
    @Inject(supabaseConfig.KEY)
    private readonly config: ConfigType<typeof supabaseConfig>,
  ) {}

  onModuleInit() {
    if (!this.config.enabled || !this.config.url || !this.config.serviceRoleKey) {
      this.logger.warn(
        "Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.",
      );
      return;
    }

    this.adminClient = createClient(this.config.url, this.config.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (this.config.anonKey) {
      this.anonClient = createClient(this.config.url, this.config.anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
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
    return this.config.enabled && this.adminClient !== null;
  }

  /**
   * Create a client scoped to a specific user's JWT.
   * Useful for making requests that respect RLS as a particular user.
   */
  forUser(accessToken: string): SupabaseClient | null {
    if (!this.config.enabled || !this.config.url || !this.config.anonKey) return null;

    return createClient(this.config.url, this.config.anonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
