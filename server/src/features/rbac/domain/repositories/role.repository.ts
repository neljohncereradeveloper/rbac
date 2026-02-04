import { PaginatedResult } from '@/core/utils/pagination.util';
import { Role } from '../models/role.model';

export interface RoleRepository<Context = unknown> {
  // Note: create() and update() methods removed
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  // These methods are not used since roles cannot be created or updated via the application
  findById(id: number, context: Context): Promise<Role | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Role>>;
  findByName(name: string, context: Context): Promise<Role | null>;
  combobox(context: Context): Promise<Role[]>;
}
