import { RolePermission } from '../models/role-permission.model';

/**
 * Manages the many-to-many relationship between roles and permissions.
 * Note: assignToRole and removeFromRole removed - role-permission assignments are managed via seeders only.
 */
export interface RolePermissionRepository<Context = unknown> {
  /** Create a single role-permission link. */
  create(
    role_permission: RolePermission,
    context: Context,
  ): Promise<RolePermission>;

  // Note: assignToRole removed - role-permission assignments are managed via seeders only
  // Note: removeFromRole removed - role-permission assignments are managed via seeders only

  /** Get all permission IDs assigned to a role. */
  findPermissionIdsByRoleId(
    role_id: number,
    context: Context,
  ): Promise<number[]>;

  /** Get all role-permission links for a role. */
  findByRoleId(role_id: number, context: Context): Promise<RolePermission[]>;

  /** Check if a role has a specific permission. */
  exists(
    role_id: number,
    permission_id: number,
    context: Context,
  ): Promise<boolean>;
}
