import { PaginatedResult } from '@/core/utils/pagination.util';
import { Role } from '../models/role.model';

export interface RoleRepository<Context = unknown> {
  /** Create a role. Optionally link permissions via permission_ids. */
  create(
    role: Role,
    context: Context,
    permission_ids?: number[],
  ): Promise<Role>;
  update(
    id: number,
    dto: Partial<Role>,
    context: Context,
  ): Promise<boolean>;
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
