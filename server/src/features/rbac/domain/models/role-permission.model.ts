import { getPHDateTime } from '@/core/utils/date.util';
import { RolePermissionBusinessException } from '../exceptions/role-permission-business.exception';
import { HTTP_STATUS } from '@/core/domain/constants';

/**
 * Represents the association between a Role and a Permission.
 * A role gains a permission when this link exists.
 * When fetched with joins, role and permission details are populated.
 */
export class RolePermission {
  role_id: number;
  permission_id: number;
  created_by: string | null;
  created_at: Date;
  /** Populated when joined with roles table */
  role_name?: string;
  /** Populated when joined with roles table */
  role_description?: string | null;
  /** Populated when joined with permissions table */
  permission_name?: string;
  /** Populated when joined with permissions table */
  permission_resource?: string;
  /** Populated when joined with permissions table */
  permission_action?: string;
  /** Populated when joined with permissions table */
  permission_description?: string | null;

  constructor(dto: {
    role_id: number;
    permission_id: number;
    created_by?: string | null;
    created_at?: Date;
    role_name?: string;
    role_description?: string | null;
    permission_name?: string;
    permission_resource?: string;
    permission_action?: string;
    permission_description?: string | null;
  }) {
    this.role_id = dto.role_id;
    this.permission_id = dto.permission_id;
    this.created_by = dto.created_by ?? null;
    this.created_at = dto.created_at ?? getPHDateTime();
    this.role_name = dto.role_name;
    this.role_description = dto.role_description ?? null;
    this.permission_name = dto.permission_name;
    this.permission_resource = dto.permission_resource;
    this.permission_action = dto.permission_action;
    this.permission_description = dto.permission_description ?? null;
  }

  /** Static factory: create and validate. */
  static create(params: {
    role_id: number;
    permission_id: number;
    created_by?: string | null;
  }): RolePermission {
    const role_permission = new RolePermission({
      role_id: params.role_id,
      permission_id: params.permission_id,
      created_by: params.created_by ?? null,
    });
    role_permission.validate();
    return role_permission;
  }

  /** Create multiple RolePermission instances for bulk assignment. */
  static createMany(params: {
    role_id: number;
    permission_ids: number[];
    created_by?: string | null;
  }): RolePermission[] {
    return params.permission_ids.map((permission_id) =>
      RolePermission.create({
        role_id: params.role_id,
        permission_id,
        created_by: params.created_by ?? null,
      }),
    );
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.role_id || this.role_id <= 0) {
      throw new RolePermissionBusinessException(
        'Role ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.permission_id || this.permission_id <= 0) {
      throw new RolePermissionBusinessException(
        'Permission ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
