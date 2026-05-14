import {
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { authConfig } from "../../config/configs/auth.config";
import { SupabaseService } from "../../integrations/supabase";
import type { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto } from "./dto";
import type { AuthUser } from "./interfaces";
import { UserRole } from "./interfaces";

/**
 * Core authentication service.
 *
 * Delegates token management to Supabase Auth and provides
 * a clean application-layer API for the auth controller.
 *
 * Full flow implementation (signup confirmation emails, OAuth providers,
 * password reset) will be added in a future iteration.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * Register a new user via Supabase Auth.
   * @throws NotImplementedException — scaffold only
   */
  async register(_dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.debug("register() called — not yet implemented");
    throw new NotImplementedException("Registration is not yet available");
  }

  /**
   * Authenticate with email + password.
   * @throws NotImplementedException — scaffold only
   */
  async login(_dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.debug("login() called — not yet implemented");
    throw new NotImplementedException("Login is not yet available");
  }

  /**
   * Exchange a refresh token for a new token pair.
   * @throws NotImplementedException — scaffold only
   */
  async refreshToken(_dto: RefreshTokenDto): Promise<AuthResponseDto> {
    this.logger.debug("refreshToken() called — not yet implemented");
    throw new NotImplementedException("Token refresh is not yet available");
  }

  /**
   * Invalidate the current session's refresh token.
   * @throws NotImplementedException — scaffold only
   */
  async logout(_userId: string): Promise<void> {
    this.logger.debug("logout() called — not yet implemented");
    throw new NotImplementedException("Logout is not yet available");
  }

  /**
   * Map a validated Supabase user into the application's AuthUser shape.
   * Used by guards after token validation.
   */
  mapToAuthUser(supabaseUser: {
    id: string;
    email?: string | null;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  }): AuthUser {
    const appMetadata = supabaseUser.app_metadata ?? {};
    const rawRoles = Array.isArray(appMetadata.roles) ? appMetadata.roles : [];

    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      roles: rawRoles.filter((r): r is UserRole => Object.values(UserRole).includes(r as UserRole)),
      metadata: (supabaseUser.user_metadata ?? {}) as Record<string, unknown>,
    };
  }

  /**
   * Retrieve the current user's profile from Supabase.
   * Requires a valid access token (provided by the guard).
   */
  async getCurrentUser(accessToken: string): Promise<AuthUser> {
    const client = this.supabase.forUser(accessToken);
    if (!client) {
      throw new UnauthorizedException("Auth service unavailable");
    }

    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    return this.mapToAuthUser(user);
  }
}
