// Enums & constants
export { Permission } from "./permissions.enum";
export { ROLE_HIERARCHY, ROLE_PERMISSIONS } from "./role-permissions.map";

// Utilities
export {
  getEffectiveRoles,
  getPermissionsForRoles,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isAdmin,
  hasRole,
} from "./authorization.utils";

// Decorators
export {
  RequirePermissions,
  RequireAnyPermission,
  PERMISSIONS_KEY,
  ResourceOwner,
  RESOURCE_OWNER_KEY,
} from "./decorators";

// Guards
export { PermissionsGuard, ResourceOwnerGuard } from "./guards";
