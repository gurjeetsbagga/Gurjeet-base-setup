import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Inject } from "@nestjs/common";
import { SignJWT, jwtVerify } from "jose";
import { authConfig } from "../../../config/configs/auth.config";
import { parseDurationToSeconds } from "../utils/duration.util";
import type { UserRole } from "../interfaces";

export type LocalTokenType = "access" | "refresh";

export interface LocalAccessClaims {
  sub: string;
  email: string;
  roles: UserRole[];
  type: LocalTokenType;
}

@Injectable()
export class LocalTokenService {
  private readonly encoder = new TextEncoder();

  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  get isConfigured(): boolean {
    return Boolean(this.config.jwtSecret);
  }

  async signAccessToken(payload: Omit<LocalAccessClaims, "type">): Promise<string> {
    return this.sign({ ...payload, type: "access" }, this.config.jwtExpiresIn);
  }

  async signRefreshToken(payload: Omit<LocalAccessClaims, "type">): Promise<string> {
    return this.sign({ ...payload, type: "refresh" }, this.config.jwtRefreshExpiresIn);
  }

  async verifyAccessToken(token: string): Promise<LocalAccessClaims> {
    const claims = await this.verify(token);
    if (claims.type !== "access") {
      throw new UnauthorizedException("Invalid access token");
    }
    return claims;
  }

  async verifyRefreshToken(token: string): Promise<LocalAccessClaims> {
    const claims = await this.verify(token);
    if (claims.type !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return claims;
  }

  getAccessExpiresInSeconds(): number {
    return parseDurationToSeconds(this.config.jwtExpiresIn);
  }

  private async sign(payload: LocalAccessClaims, expiresIn: string): Promise<string> {
    const secret = this.requireSecret();
    const seconds = parseDurationToSeconds(expiresIn);

    return new SignJWT({ email: payload.email, roles: payload.roles, type: payload.type })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(`${seconds}s`)
      .sign(secret);
  }

  private async verify(token: string): Promise<LocalAccessClaims> {
    const secret = this.requireSecret();

    try {
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      const sub = payload.sub;
      const email = payload.email;
      const type = payload.type;
      const roles = payload.roles;

      if (typeof sub !== "string" || typeof email !== "string" || typeof type !== "string") {
        throw new UnauthorizedException("Invalid token payload");
      }

      if (type !== "access" && type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      const normalizedRoles = Array.isArray(roles)
        ? roles.filter((r): r is UserRole => typeof r === "string")
        : [];

      return {
        sub,
        email,
        type: type as LocalTokenType,
        roles: normalizedRoles,
      };
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private requireSecret(): Uint8Array {
    if (!this.config.jwtSecret) {
      throw new UnauthorizedException("Local auth is not configured");
    }
    return this.encoder.encode(this.config.jwtSecret);
  }
}
