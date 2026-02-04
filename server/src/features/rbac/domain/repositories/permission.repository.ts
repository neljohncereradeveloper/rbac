import { PaginatedResult } from '@/core/utils/pagination.util';
import { Permission } from '../models/permission.model';

export interface PermissionRepository<Context = unknown> {
  // Note: create() and update() methods removed - permissions are statically defined and managed via seeders only
  findById(id: number, context: Context): Promise<Permission | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Permission>>;
  findAll(
    term: string,
    is_archived: boolean,
    context: Context,
  ): Promise<Permission[]>;
  findByName(name: string, context: Context): Promise<Permission | null>;
  findByResourceAndAction(
    resource: string,
    action: string,
    context: Context,
  ): Promise<Permission | null>;
  combobox(context: Context): Promise<Permission[]>;
}
