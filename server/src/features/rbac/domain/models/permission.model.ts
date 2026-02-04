import { getPHDateTime } from '@/core/utils/date.util';
// Note: HTTP_STATUS and PermissionBusinessException imports removed - no longer needed
// Permissions are statically defined and managed via seeders only

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

  // Note: create(), update(), archive(), restore(), validate() methods removed
  // Permissions are statically defined and managed via seeders only
}
