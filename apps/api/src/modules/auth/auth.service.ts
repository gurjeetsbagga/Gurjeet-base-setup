import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { UserRole as PrismaUserRole } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { appConfig } from "../../config/configs/app.config";
import { authConfig } from "../../config/configs/auth.config";
import { MailService } from "../../integrations/mail/mail.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SupabaseService } from "../../integrations/supabase";
import { UsersService } from "../users/users.service";
import type {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponseDto,
  ResetPasswordDto,
} from "./dto";
import { PASSWORD_RESET_REQUEST_MESSAGE } from "./dto/forgot-password.dto";
import { LocalTokenService } from "./services/local-token.service";
import { hashPassword, verifyPassword } from "./utils/password.util";
import { generateResetToken, hashResetToken } from "./utils/reset-token.util";
import type { AuthUser } from "./interfaces";
import { UserRole } from "./interfaces";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const PASSWORD_RESET_SUCCESS_MESSAGE = "Your password has been updated. You can sign in now.";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    @Inject(appConfig.KEY)
    private readonly app: ConfigType<typeof appConfig>,
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly localToken: LocalTokenService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (this.supabase.isEnabled) {
      return this.registerWithSupabase(dto);
    }
    if (this.localToken.isConfigured) {
      return this.registerWithLocal(dto);
    }
    throw new ServiceUnavailableException(
      "Authentication is not configured. Set Supabase credentials or API_JWT_SECRET.",
    );
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    if (this.supabase.isEnabled) {
      return this.loginWithSupabase(dto);
    }
    if (this.localToken.isConfigured) {
      return this.loginWithLocal(dto);
    }
    throw new ServiceUnavailableException(
      "Authentication is not configured. Set Supabase credentials or API_JWT_SECRET.",
    );
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    if (this.supabase.isEnabled) {
      return this.refreshWithSupabase(dto);
    }
    if (this.localToken.isConfigured) {
      return this.refreshWithLocal(dto);
    }
    throw new ServiceUnavailableException(
      "Authentication is not configured. Set Supabase credentials or API_JWT_SECRET.",
    );
  }

  async logout(_userId: string): Promise<void> {
    if (this.supabase.isEnabled && this.supabase.admin) {
      await this.supabase.admin.auth.admin.signOut(_userId, "global");
    }
    this.logger.debug(`logout() user=${_userId}`);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const normalized = email.trim().toLowerCase();

    try {
      if (this.supabase.isEnabled) {
        await this.requestPasswordResetSupabase(normalized);
      } else if (this.localToken.isConfigured) {
        await this.requestPasswordResetLocal(normalized);
      }
    } catch (err) {
      this.logger.warn(`requestPasswordReset failed for ${normalized}: ${String(err)}`);
    }

    return { message: PASSWORD_RESET_REQUEST_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.accessToken) {
      if (!this.supabase.isEnabled) {
        throw new BadRequestException("Invalid or expired reset link");
      }
      await this.resetPasswordSupabase(dto.accessToken, dto.password);
      return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
    }

    if (dto.token) {
      if (!this.localToken.isConfigured) {
        throw new BadRequestException("Invalid or expired reset link");
      }
      await this.resetPasswordLocal(dto.token, dto.password);
      return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
    }

    throw new BadRequestException("Invalid or expired reset link");
  }

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

  async getCurrentUser(accessToken: string): Promise<AuthUser> {
    if (this.supabase.isEnabled) {
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

      return this.resolveAuthUserFromAuthId(user.id, user.email ?? "", user.user_metadata ?? {});
    }

    if (this.localToken.isConfigured) {
      const claims = await this.localToken.verifyAccessToken(accessToken);
      const dbUser = await this.prisma.user.findUnique({ where: { id: claims.sub } });
      if (!dbUser || !dbUser.isActive) {
        throw new UnauthorizedException("Invalid or expired token");
      }
      return this.toAuthUser(dbUser);
    }

    throw new UnauthorizedException("Auth service unavailable");
  }

  async resolveAuthUserFromToken(accessToken: string): Promise<AuthUser> {
    if (this.supabase.isEnabled) {
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

      return this.resolveAuthUserFromAuthId(user.id, user.email ?? "", user.user_metadata ?? {});
    }

    if (this.localToken.isConfigured) {
      const claims = await this.localToken.verifyAccessToken(accessToken);
      const dbUser = await this.prisma.user.findUnique({ where: { id: claims.sub } });
      if (!dbUser || !dbUser.isActive) {
        throw new UnauthorizedException("Invalid or expired token");
      }
      return this.toAuthUser(dbUser);
    }

    throw new UnauthorizedException("Auth service unavailable");
  }

  // ── Supabase ────────────────────────────────────────────────

  private async registerWithSupabase(dto: RegisterDto): Promise<AuthResponseDto> {
    const admin = this.supabase.admin;
    if (!admin) {
      throw new ServiceUnavailableException("Supabase admin client unavailable");
    }

    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: dto.displayName ? { display_name: dto.displayName } : undefined,
    });

    if (error || !data.user) {
      this.logger.warn(`Supabase register failed: ${error?.message ?? "unknown"}`);
      throw new ConflictException(error?.message ?? "Registration failed");
    }

    const profile = await this.users.create({
      authId: data.user.id,
      email: dto.email,
      displayName: dto.displayName,
      role: PrismaUserRole.USER,
    });

    const client = this.supabase.client;
    if (!client) {
      throw new ServiceUnavailableException("Supabase anon client unavailable");
    }

    const signIn = await client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (signIn.error || !signIn.data.session) {
      throw new UnauthorizedException(signIn.error?.message ?? "Unable to create session");
    }

    return this.buildAuthResponse(
      profile.id,
      dto.email,
      profile.displayName ?? undefined,
      [this.mapPrismaRole(profile.role)],
      signIn.data.session.access_token,
      signIn.data.session.refresh_token,
      signIn.data.session.expires_in ?? 3600,
    );
  }

  private async loginWithSupabase(dto: LoginDto): Promise<AuthResponseDto> {
    const client = this.supabase.client;
    if (!client) {
      throw new ServiceUnavailableException("Supabase anon client unavailable");
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const profile = await this.users.findByAuthId(data.user.id).catch(() => {
      return this.users.create({
        authId: data.user!.id,
        email: dto.email,
        role: PrismaUserRole.USER,
      });
    });

    return this.buildAuthResponse(
      profile.id,
      profile.email,
      profile.displayName ?? undefined,
      [this.mapPrismaRole(profile.role)],
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_in ?? 3600,
    );
  }

  private async refreshWithSupabase(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const client = this.supabase.client;
    if (!client) {
      throw new ServiceUnavailableException("Supabase anon client unavailable");
    }

    const { data, error } = await client.auth.refreshSession({ refresh_token: dto.refreshToken });
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const profile = await this.users.findByAuthId(data.user.id);
    return this.buildAuthResponse(
      profile.id,
      profile.email,
      profile.displayName ?? undefined,
      [this.mapPrismaRole(profile.role)],
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_in ?? 3600,
    );
  }

  // ── Password reset ───────────────────────────────────────────

  private getWebAppUrl(): string {
    const url = this.app.webUrl ?? process.env.WEB_URL ?? process.env.APP_URL;
    if (!url) {
      throw new ServiceUnavailableException("WEB_URL is not configured");
    }
    return url.replace(/\/$/, "");
  }

  private async requestPasswordResetSupabase(email: string): Promise<void> {
    const client = this.supabase.client;
    if (!client) {
      throw new ServiceUnavailableException("Supabase anon client unavailable");
    }

    const redirectTo = `${this.getWebAppUrl()}/reset-password`;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      throw error;
    }
  }

  private async requestPasswordResetLocal(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !user.isActive) {
      return;
    }

    const rawToken = generateResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${this.getWebAppUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await this.mail.sendPasswordReset({ to: email, resetUrl });
  }

  private async resetPasswordSupabase(accessToken: string, password: string): Promise<void> {
    const admin = this.supabase.admin;
    if (!admin) {
      throw new ServiceUnavailableException("Supabase admin client unavailable");
    }

    const { data, error } = await admin.auth.getUser(accessToken);
    if (error || !data.user) {
      throw new BadRequestException("Invalid or expired reset link");
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(data.user.id, {
      password,
    });
    if (updateError) {
      this.logger.warn(`Supabase password update failed: ${updateError.message}`);
      throw new BadRequestException("Unable to reset password. Please request a new link.");
    }
  }

  private async resetPasswordLocal(rawToken: string, password: string): Promise<void> {
    const tokenHash = hashResetToken(rawToken);
    const record = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record?.user.isActive) {
      throw new BadRequestException("Invalid or expired reset link");
    }

    const passwordHash = await hashPassword(password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null, id: { not: record.id } },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  // ── Local JWT (development) ─────────────────────────────────

  private async registerWithLocal(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await hashPassword(dto.password);
    const authId = randomUUID();

    const user = await this.prisma.user.create({
      data: {
        authId,
        email: dto.email,
        displayName: dto.displayName,
        passwordHash,
        role: PrismaUserRole.USER,
      },
    });

    return this.issueLocalTokens(user);
  }

  private async loginWithLocal(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user?.passwordHash || !user.isActive) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueLocalTokens(user);
  }

  private async refreshWithLocal(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const claims = await this.localToken.verifyRefreshToken(dto.refreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: claims.sub } });
    if (!user?.isActive) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.issueLocalTokens(user);
  }

  private async issueLocalTokens(user: {
    id: string;
    email: string;
    displayName: string | null;
    role: PrismaUserRole;
  }): Promise<AuthResponseDto> {
    const roles = [this.mapPrismaRole(user.role)];
    const tokenPayload = { sub: user.id, email: user.email, roles };

    const accessToken = await this.localToken.signAccessToken(tokenPayload);
    const refreshToken = await this.localToken.signRefreshToken(tokenPayload);

    return this.buildAuthResponse(
      user.id,
      user.email,
      user.displayName ?? undefined,
      roles,
      accessToken,
      refreshToken,
      this.localToken.getAccessExpiresInSeconds(),
    );
  }

  // ── Helpers ─────────────────────────────────────────────────

  private async resolveAuthUserFromAuthId(
    authId: string,
    email: string,
    metadata: Record<string, unknown>,
  ): Promise<AuthUser> {
    const dbUser = await this.prisma.user.findUnique({ where: { authId } });
    if (!dbUser || !dbUser.isActive) {
      throw new UnauthorizedException("User account not found");
    }

    return {
      id: dbUser.id,
      email: dbUser.email || email,
      roles: [this.mapPrismaRole(dbUser.role)],
      metadata: {
        ...metadata,
        ...(dbUser.displayName ? { display_name: dbUser.displayName } : {}),
      },
    };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    displayName: string | null;
    role: PrismaUserRole;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      roles: [this.mapPrismaRole(user.role)],
      metadata: user.displayName ? { display_name: user.displayName } : {},
    };
  }

  private buildAuthResponse(
    id: string,
    email: string,
    displayName: string | undefined,
    roles: UserRole[],
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): AuthResponseDto {
    return {
      user: { id, email, displayName, roles },
      tokens: { accessToken, refreshToken, expiresIn },
    };
  }

  private mapPrismaRole(role: PrismaUserRole): UserRole {
    switch (role) {
      case PrismaUserRole.ADMIN:
        return UserRole.ADMIN;
      case PrismaUserRole.PROVIDER:
        return UserRole.PROVIDER;
      default:
        return UserRole.USER;
    }
  }
}
