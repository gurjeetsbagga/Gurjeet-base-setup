import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LocalTokenService } from "./services/local-token.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { PermissionsGuard, ResourceOwnerGuard } from "../../common/authorization";
import { UsersModule } from "../users/users.module";

/**
 * Authentication & authorization module.
 *
 * Registers four global guards (via APP_GUARD) in execution order:
 *   1. JwtAuthGuard      — validates Bearer tokens, respects @Public()
 *   2. RolesGuard        — enforces @Roles() with role hierarchy
 *   3. PermissionsGuard  — enforces @RequirePermissions() / @RequireAnyPermission()
 *   4. ResourceOwnerGuard — enforces @ResourceOwner() ownership checks
 *
 * Guards are opt-in: routes without the corresponding decorator
 * pass through unchecked by that guard. JwtAuthGuard is the only
 * one that blocks by default (unless @Public() is applied).
 */
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceOwnerGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
