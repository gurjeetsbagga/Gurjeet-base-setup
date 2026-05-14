import { UserRole } from "../../modules/auth/interfaces";
import { Permission } from "./permissions.enum";
import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from "./role-permissions.map";

/**
 * Expands a set of roles to include all inherited roles.
 *
 * Example:
 *   getEffectiveRoles([UserRole.ADMIN])
 *   → [UserRole.ADMIN, UserRole.USER, UserRole.PROVIDER]
 */
export function getEffectiveRoles(roles: UserRole[]): UserRole[] {
  const effective = new Set<UserRole>(roles);

  for (const role of roles) {
    for (const inherited of ROLE_HIERARCHY[role]) {
      effective.add(inherited);
    }
  }

  return [...effective];
}

/**
 * Resolves all permissions for a set of roles,
 * including permissions inherited through the role hierarchy.
 */
export function getPermissionsForRoles(roles: UserRole[]): Permission[] {
  const effective = getEffectiveRoles(roles);
  const permissions = new Set<Permission>();

  for (const role of effective) {
    for (const permission of ROLE_PERMISSIONS[role]) {
      permissions.add(permission);
    }
  }

  return [...permissions];
}

/**
 * Returns true if the given roles (after hierarchy expansion)
 * include the requested permission.
 */
export function hasPermission(roles: UserRole[], permission: Permission): boolean {
  return getPermissionsForRoles(roles).includes(permission);
}

/**
 * Returns true if the given roles (after hierarchy expansion)
 * include ALL of the requested permissions.
 */
export function hasAllPermissions(roles: UserRole[], permissions: Permission[]): boolean {
  const resolved = new Set(getPermissionsForRoles(roles));
  return permissions.every((p) => resolved.has(p));
}

/**
 * Returns true if the given roles (after hierarchy expansion)
 * include ANY of the requested permissions.
 */
export function hasAnyPermission(roles: UserRole[], permissions: Permission[]): boolean {
  const resolved = new Set(getPermissionsForRoles(roles));
  return permissions.some((p) => resolved.has(p));
}

/**
 * Shorthand — checks whether the user's roles include ADMIN
 * (directly, without hierarchy expansion).
 */
export function isAdmin(roles: UserRole[]): boolean {
  return roles.includes(UserRole.ADMIN);
}

/**
 * Returns true if `roles` include the target role directly
 * or through hierarchy inheritance.
 */
export function hasRole(roles: UserRole[], target: UserRole): boolean {
  return getEffectiveRoles(roles).includes(target);
}
