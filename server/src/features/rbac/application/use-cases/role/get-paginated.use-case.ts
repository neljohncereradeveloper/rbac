import { PaginatedResult } from '@/core/utils/pagination.util';
import { Role } from '../../../domain/models/role.model';
import { RoleRepository } from '../../../domain/repositories/role.repository';

export class GetRolesPaginatedUseCase<Context = unknown> {
  constructor(private readonly role_repository: RoleRepository<Context>) {}

  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Role>> {
    return await this.role_repository.findPaginatedList(
      term,
      page,
      limit,
      is_archived,
      context,
    );
  }
}
