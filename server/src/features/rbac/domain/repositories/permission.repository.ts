import { PaginatedResult } from '@/core/utils/pagination.util';
import { Permission } from '../models/permission.model';

export interface PermissionRepository<Context = unknown> {
  create(model: Permission, context: Context): Promise<Permission>;
  update(
    id: number,
    dto: Partial<Permission>,
    context: Context,
  ): Promise<boolean>;
  findById(id: number, context: Context): Promise<Permission | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Permission>>;
  findByName(name: string, context: Context): Promise<Permission | null>;
  findByResourceAndAction(
    resource: string,
    action: string,
    context: Context,
  ): Promise<Permission | null>;
  combobox(context: Context): Promise<Permission[]>;
}
