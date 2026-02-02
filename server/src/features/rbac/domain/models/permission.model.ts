import { HTTP_STATUS } from '@/core/domain/constants';
import { getPHDateTime } from '@/core/utils/date.util';
import { PermissionBusinessException } from '../exceptions';

export class Permission {
  id?: number;
  name: string;
  resource: string;
  action: string;
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
    resource: string;
    action: string;
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
    this.resource = dto.resource;
    this.action = dto.action;
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
    resource: string;
    action: string;
    description?: string | null;
    created_by?: string | null;
  }): Permission {
    const permission = new Permission({
      name: params.name,
      resource: params.resource,
      action: params.action,
      description: params.description ?? null,
      created_by: params.created_by ?? null,
    });
    permission.validate();
    return permission;
  }

  /** Update details; validate new state before applying. */
  update(dto: {
    name: string;
    resource: string;
    action: string;
    description?: string | null;
    updated_by?: string | null;
  }): void {
    if (this.deleted_at) {
      throw new PermissionBusinessException(
        'Permission is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }
    const temp_permission = new Permission({
      id: this.id,
      name: dto.name,
      resource: dto.resource,
      action: dto.action,
      description: dto.description ?? this.description,
      created_at: this.created_at,
      updated_at: this.updated_at,
    });
    temp_permission.validate();
    this.name = dto.name;
    this.resource = dto.resource;
    this.action = dto.action;
    this.description = dto.description ?? this.description;
    this.updated_by = dto.updated_by ?? null;
  }

  /** Soft-delete. */
  archive(deleted_by: string): void {
    if (this.deleted_at) {
      throw new PermissionBusinessException(
        'Permission is already archived.',
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /** Restore from archive. */
  restore(): void {
    if (!this.deleted_at) {
      throw new PermissionBusinessException(
        `Permission with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new PermissionBusinessException(
        'Permission name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.name.length > 255) {
      throw new PermissionBusinessException(
        'Permission name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.resource || this.resource.trim().length === 0) {
      throw new PermissionBusinessException(
        'Permission resource is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.resource.length > 100) {
      throw new PermissionBusinessException(
        'Permission resource must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.action || this.action.trim().length === 0) {
      throw new PermissionBusinessException(
        'Permission action is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.action.length > 50) {
      throw new PermissionBusinessException(
        'Permission action must not exceed 50 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.description !== null && this.description !== undefined) {
      if (this.description.length > 500) {
        throw new PermissionBusinessException(
          'Permission description must not exceed 500 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
  }
}
