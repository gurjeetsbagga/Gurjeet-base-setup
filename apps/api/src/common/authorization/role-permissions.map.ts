import { UserRole } from "../../modules/auth/interfaces";
import { Permission } from "./permissions.enum";

/**
 * Role hierarchy — each role inherits the permissions of roles
 * listed in its array. Evaluated transitively.
 *
 *   ADMIN    → inherits PROVIDER → inherits USER
 *   PROVIDER → inherits USER
 *   USER     → base role (no inheritance)
 */
export const ROLE_HIERARCHY: Readonly<Record<UserRole, readonly UserRole[]>> = {
  [UserRole.USER]: [],
  [UserRole.PROVIDER]: [UserRole.USER],
  [UserRole.ADMIN]: [UserRole.USER, UserRole.PROVIDER],
};

/**
 * Direct permissions per role (before hierarchy expansion).
 *
 * After hierarchy expansion, an ADMIN gets all permissions listed
 * for ADMIN + PROVIDER + USER.
 */
export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = {
  [UserRole.USER]: [
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
    Permission.CREATE_CONVERSATION,
    Permission.READ_OWN_CONVERSATIONS,
    Permission.SEND_MESSAGE,
    Permission.READ_OWN_MEMORY,
    Permission.WRITE_OWN_MEMORY,
    Permission.PROPOSE_ACTION,
    Permission.RESOLVE_OWN_ACTION,
  ],

  [UserRole.PROVIDER]: [Permission.READ_PROVIDER_DATA, Permission.WRITE_PROVIDER_DATA],

  [UserRole.ADMIN]: [
    Permission.READ_ALL_USERS,
    Permission.MANAGE_USERS,
    Permission.READ_AUDIT_LOGS,
    Permission.MANAGE_AI_CONFIG,
    Permission.MANAGE_MODERATION,
    Permission.READ_SYSTEM_OVERVIEW,
  ],
};
