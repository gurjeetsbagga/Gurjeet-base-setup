import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { THROTTLE_AUTH } from "../../common/throttle";
import { successResponse } from "../../shared/api-response";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { toAuthClientDto } from "./dto/auth-client.dto";
import type { AuthUser } from "./interfaces";

@Throttle({ [THROTTLE_AUTH]: {} })
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return successResponse(toAuthClientDto(result));
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return successResponse(toAuthClientDto(result));
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(dto);
    return successResponse(toAuthClientDto(result));
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser("id") userId: string) {
    await this.authService.logout(userId);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser | null) {
    if (!user) {
      return successResponse(null);
    }

    const displayName =
      typeof user.metadata.display_name === "string" ? user.metadata.display_name : undefined;

    return successResponse({
      id: user.id,
      email: user.email,
      displayName,
      roles: user.roles,
    });
  }
}
