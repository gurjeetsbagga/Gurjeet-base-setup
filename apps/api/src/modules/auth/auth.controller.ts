import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { THROTTLE_AUTH } from "../../common/throttle";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

/**
 * Authentication endpoints — versioned under /api/v1/auth.
 *
 * Public routes are marked with @Public() so the global JwtAuthGuard
 * skips them. Protected routes require a valid Bearer token.
 *
 * All public auth routes use the "auth" throttle tier (stricter than
 * global) to prevent brute-force and credential-stuffing attacks.
 */
@Throttle({ [THROTTLE_AUTH]: {} })
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@CurrentUser("id") userId: string) {
    return this.authService.logout(userId);
  }

  @Get("me")
  me(@Req() req: Request) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return this.authService.getCurrentUser(token);
  }
}
