import { UserPermission } from '../models/user-permission.model';

/**
 * Manages explicit permission grants and denials for users.
 * These overrides take precedence over role-based permissions.
 */
export interface UserPermissionRepository<Context = unknown> {
  /** Create a single user-permission override. */
  create(
    user_permission: UserPermission,
    context: Context,
  ): Promise<UserPermission>;

  /** Assign permissions to a user (grant or deny). Replaces existing overrides if replace is true. */
  assignToUser(
    user_id: number,
    permission_ids: number[],
    is_allowed: boolean,
    context: Context,
    replace?: boolean,
  ): Promise<void>;

  /** Remove specific permission overrides from a user. */
  removeFromUser(
    user_id: number,
    permission_ids: number[],
    context: Context,
  ): Promise<void>;

  /** Explicitly grant permissions to a user (is_allowed: true). */
  grantToUser(
    user_id: number,
    permission_ids: number[],
    context: Context,
  ): Promise<void>;

  /** Explicitly deny permissions to a user (is_allowed: false). */
  denyToUser(
    user_id: number,
    permission_ids: number[],
    context: Context,
  ): Promise<void>;

  /** Get all user-permission overrides for a user. */
  findByUserId(user_id: number, context: Context): Promise<UserPermission[]>;

  /** Get all explicitly granted permissions for a user (is_allowed: true). */
  findAllowedByUserId(
    user_id: number,
    context: Context,
  ): Promise<UserPermission[]>;

  /** Get all explicitly denied permissions for a user (is_allowed: false). */
  findDeniedByUserId(
    user_id: number,
    context: Context,
  ): Promise<UserPermission[]>;

  /** Check if a user has a specific permission override. */
  exists(
    user_id: number,
    permission_id: number,
    context: Context,
  ): Promise<boolean>;
}
