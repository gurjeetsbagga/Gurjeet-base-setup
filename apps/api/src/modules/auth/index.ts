export { AuthModule } from "./auth.module";
export { AuthService } from "./auth.service";
export { JwtAuthGuard, RolesGuard } from "./guards";
export type { AuthUser } from "./interfaces";
export { UserRole } from "./interfaces";
export type { JwtPayload, TokenPair } from "./interfaces";
export { LoginDto, RegisterDto, RefreshTokenDto } from "./dto";
export type { AuthResponseDto } from "./dto";

export {
  Permission,
  RequirePermissions,
  RequireAnyPermission,
  ResourceOwner,
  PermissionsGuard,
  ResourceOwnerGuard,
  isAdmin,
  hasRole,
  hasPermission,
  getEffectiveRoles,
  getPermissionsForRoles,
} from "../../common/authorization";
