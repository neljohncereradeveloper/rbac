import { getPHDateTime } from '@/core/utils/date.util';
import { UserRoleBusinessException } from '../exceptions/user-role-business.exception';
import { HTTP_STATUS } from '@/core/domain/constants';

/**
 * Represents the association between a User and a Role.
 * A user gains the permissions of a role when this link exists.
 * When fetched with joins, username and role_description are populated.
 */
export class UserRole {
  user_id: number;
  role_id: number;
  created_by: string | null;
  created_at: Date;
  /** Populated when joined with users table */
  username?: string;
  /** Populated when joined with roles table */
  role_description?: string | null;

  constructor(dto: {
    user_id: number;
    role_id: number;
    created_by?: string | null;
    created_at?: Date;
    username?: string;
    role_description?: string | null;
  }) {
    this.user_id = dto.user_id;
    this.role_id = dto.role_id;
    this.created_by = dto.created_by ?? null;
    this.created_at = dto.created_at ?? getPHDateTime();
    this.username = dto.username;
    this.role_description = dto.role_description ?? null;
  }

  /** Static factory: create and validate. */
  static create(params: {
    user_id: number;
    role_id: number;
    created_by?: string | null;
  }): UserRole {
    const user_role = new UserRole({
      user_id: params.user_id,
      role_id: params.role_id,
      created_by: params.created_by ?? null,
    });
    user_role.validate();
    return user_role;
  }

  /** Create multiple UserRole instances for bulk assignment. */
  static createMany(params: {
    user_id: number;
    role_ids: number[];
    created_by?: string | null;
  }): UserRole[] {
    return params.role_ids.map((role_id) =>
      UserRole.create({
        user_id: params.user_id,
        role_id,
        created_by: params.created_by ?? null,
      }),
    );
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.user_id || this.user_id <= 0) {
      throw new UserRoleBusinessException(
        'User ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.role_id || this.role_id <= 0) {
      throw new UserRoleBusinessException(
        'Role ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
