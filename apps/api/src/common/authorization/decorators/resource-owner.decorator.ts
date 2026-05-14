import { SetMetadata } from "@nestjs/common";

export const RESOURCE_OWNER_KEY = "resourceOwner";

export interface ResourceOwnerMeta {
  /**
   * Route parameter that holds the resource owner's user ID.
   * Defaults to "userId".
   *
   * Example: For `GET /users/:userId/profile`, set `paramField: "userId"`.
   * The guard compares `req.params[paramField]` to `req.user.id`.
   */
  paramField: string;

  /**
   * When true, admins bypass the ownership check.
   * Defaults to true.
   */
  adminOverride: boolean;
}

/**
 * Marks a route as requiring resource ownership.
 *
 * The ResourceOwnerGuard compares the authenticated user's ID
 * against the route parameter specified by `paramField`.
 * Admins bypass the check by default (configurable).
 *
 * This is a lightweight alternative to full per-resource ACLs —
 * use for self-service endpoints where the URL encodes ownership.
 *
 * For endpoints where ownership is embedded in the resource itself
 * (e.g. conversation.userId), use service-layer ownership checks
 * instead.
 *
 * Usage:
 *   @ResourceOwner()                        // default: params.userId
 *   @Get(":userId/profile")
 *   getProfile() { ... }
 *
 *   @ResourceOwner({ paramField: "id" })    // custom param
 *   @Patch(":id/settings")
 *   updateSettings() { ... }
 */
export const ResourceOwner = (options?: Partial<ResourceOwnerMeta>) =>
  SetMetadata(RESOURCE_OWNER_KEY, {
    paramField: options?.paramField ?? "userId",
    adminOverride: options?.adminOverride ?? true,
  } satisfies ResourceOwnerMeta);
