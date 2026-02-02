import { RolePermission } from '../models/role-permission.model';

/**
 * Manages the many-to-many relationship between roles and permissions.
 * Use this to assign or remove permissions from a role.
 */
export interface RolePermissionRepository<Context = unknown> {
  /** Create a single role-permission link. */
  create(
    role_permission: RolePermission,
    context: Context,
  ): Promise<RolePermission>;

  /** Assign permissions to a role. Replaces existing assignments if replace is true. */
  assignToRole(
    role_id: number,
    permission_ids: number[],
    context: Context,
    replace?: boolean,
  ): Promise<void>;

  /** Remove specific permissions from a role. */
  removeFromRole(
    role_id: number,
    permission_ids: number[],
    context: Context,
  ): Promise<void>;

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
