import { HTTP_STATUS } from '@/cored/domain/constants';
import { getPHDateTime } from '@/core/utils/date.util';
import { RoleBusinessException } from '../exceptions';

export class Role {
  id?: number;
  name: string;
  description: string | null;
  deleted_by: string | null;
  deleted_at: Date | null;
  created_by: string | null;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date;

  constructor(dto: {
    id?: number;
    name: string;
    description?: string | null;
    deleted_by?: string | null;
    deleted_at?: Date | null;
    created_by?: string | null;
    created_at?: Date;
    updated_by?: string | null;
    updated_at?: Date;
  }) {
    this.id = dto.id;
    this.name = dto.name;
    this.description = dto.description ?? null;
    this.deleted_by = dto.deleted_by ?? null;
    this.deleted_at = dto.deleted_at ?? null;
    this.created_by = dto.created_by ?? null;
    this.created_at = dto.created_at ?? getPHDateTime();
    this.updated_by = dto.updated_by ?? null;
    this.updated_at = dto.updated_at ?? getPHDateTime();
  }

  /** Static factory: create and validate. */
  static create(params: {
    name: string;
    description?: string | null;
    created_by?: string | null;
  }): Role {
    const role = new Role({
      name: params.name,
      description: params.description ?? null,
      created_by: params.created_by ?? null,
    });
    role.validate();
    return role;
  }

  /** Update details; validate new state before applying. */
  update(dto: {
    name: string;
    description?: string | null;
    updated_by?: string | null;
  }): void {
    if (this.deleted_at) {
      throw new RoleBusinessException(
        'Role is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }
    const temp_role = new Role({
      id: this.id,
      name: dto.name,
      description: dto.description ?? this.description,
      created_at: this.created_at,
      updated_at: this.updated_at,
    });
    temp_role.validate();
    this.name = dto.name;
    this.description = dto.description ?? this.description;
    this.updated_by = dto.updated_by ?? null;
  }

  /** Soft-delete. */
  archive(deleted_by: string): void {
    if (this.deleted_at) {
      throw new RoleBusinessException(
        'Role is already archived.',
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /** Restore from archive. */
  restore(): void {
    if (!this.deleted_at) {
      throw new RoleBusinessException(
        `Role with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new RoleBusinessException(
        'Role name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.name.length > 255) {
      throw new RoleBusinessException(
        'Role name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.name.trim().length < 2) {
      throw new RoleBusinessException(
        'Role name must be at least 2 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.description !== null && this.description !== undefined) {
      if (this.description.length > 500) {
        throw new RoleBusinessException(
          'Role description must not exceed 500 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
  }
}
