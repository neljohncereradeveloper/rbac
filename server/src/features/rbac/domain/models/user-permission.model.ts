import { getPHDateTime } from '@/core/utils/date.util';
import { UserPermissionBusinessException } from '../exceptions/user-permission-business.exception';
import { HTTP_STATUS } from '@/core/domain/constants';

/**
 * Represents explicit permission grants or denials for a user.
 * This overrides role-based permissions:
 * - is_allowed: true = explicitly grant this permission (even if role doesn't have it)
 * - is_allowed: false = explicitly deny this permission (even if role grants it)
 * When fetched with joins, username and permission details are populated.
 */
export class UserPermission {
  user_id: number;
  permission_id: number;
  is_allowed: boolean;
  created_by: string | null;
  created_at: Date;
  /** Populated when joined with users table */
  username?: string;
  /** Populated when joined with permissions table */
  permission_name?: string;
  /** Populated when joined with permissions table */
  permission_description?: string | null;

  constructor(dto: {
    user_id: number;
    permission_id: number;
    is_allowed: boolean;
    created_by?: string | null;
    created_at?: Date;
    username?: string;
    permission_name?: string;
    permission_description?: string | null;
  }) {
    this.user_id = dto.user_id;
    this.permission_id = dto.permission_id;
    this.is_allowed = dto.is_allowed;
    this.created_by = dto.created_by ?? null;
    this.created_at = dto.created_at ?? getPHDateTime();
    this.username = dto.username;
    this.permission_name = dto.permission_name;
    this.permission_description = dto.permission_description ?? null;
  }

  /** Static factory: create and validate. */
  static create(params: {
    user_id: number;
    permission_id: number;
    is_allowed: boolean;
    created_by?: string | null;
  }): UserPermission {
    const user_permission = new UserPermission({
      user_id: params.user_id,
      permission_id: params.permission_id,
      is_allowed: params.is_allowed,
      created_by: params.created_by ?? null,
    });
    user_permission.validate();
    return user_permission;
  }

  /** Create multiple UserPermission instances for bulk assignment. */
  static createMany(params: {
    user_id: number;
    permission_ids: number[];
    is_allowed: boolean;
    created_by?: string | null;
  }): UserPermission[] {
    return params.permission_ids.map((permission_id) =>
      UserPermission.create({
        user_id: params.user_id,
        permission_id,
        is_allowed: params.is_allowed,
        created_by: params.created_by ?? null,
      }),
    );
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.user_id || this.user_id <= 0) {
      throw new UserPermissionBusinessException(
        'User ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.permission_id || this.permission_id <= 0) {
      throw new UserPermissionBusinessException(
        'Permission ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
