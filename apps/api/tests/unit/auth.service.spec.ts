import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { UserRole as PrismaUserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../../src/modules/auth/auth.service";
import { LocalTokenService } from "../../src/modules/auth/services/local-token.service";

describe("AuthService (local JWT)", () => {
  const authConfig = {
    jwtSecret: "test-secret-key-for-local-auth",
    jwtExpiresIn: "15m",
    jwtRefreshExpiresIn: "7d",
  };

  const prisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const users = {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findByAuthId: vi.fn(),
  };

  const app = {
    webUrl: "http://localhost:3000",
  };

  const supabase = {
    isEnabled: false,
    admin: null,
    client: null,
    forUser: vi.fn(),
  };

  const mail = {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  };

  let authService: AuthService;
  let localToken: LocalTokenService;

  beforeEach(() => {
    vi.clearAllMocks();
    localToken = new LocalTokenService(authConfig as never);
    authService = new AuthService(
      authConfig as never,
      app as never,
      supabase as never,
      prisma as never,
      users as never,
      localToken,
      mail as never,
    );
  });

  it("registers a user with hashed password and returns tokens", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: "user-1",
      email: "new@auryn.app",
      displayName: "New User",
      role: PrismaUserRole.USER,
    });

    const result = await authService.register({
      email: "new@auryn.app",
      password: "password123",
      displayName: "New User",
    });

    expect(result.user.id).toBe("user-1");
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.tokens.refreshToken).toBeTruthy();
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "new@auryn.app",
          passwordHash: expect.stringMatching(/^[a-f0-9]+:[a-f0-9]+$/),
        }),
      }),
    );
  });

  it("rejects duplicate registration", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "existing" });

    await expect(
      authService.register({
        email: "taken@auryn.app",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("logs in with valid credentials", async () => {
    const passwordHash = await import("../../src/modules/auth/utils/password.util").then((m) =>
      m.hashPassword("password123"),
    );

    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "dev@auryn.app",
      displayName: "Dev",
      role: PrismaUserRole.USER,
      passwordHash,
      isActive: true,
    });

    const result = await authService.login({
      email: "dev@auryn.app",
      password: "password123",
    });

    expect(result.user.email).toBe("dev@auryn.app");
    expect(result.tokens.accessToken).toBeTruthy();
  });

  it("rejects invalid login", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "dev@auryn.app",
      passwordHash: "bad:hash",
      isActive: true,
    });

    await expect(
      authService.login({ email: "dev@auryn.app", password: "wrongpass" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
