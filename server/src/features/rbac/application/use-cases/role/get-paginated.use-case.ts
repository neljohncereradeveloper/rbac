import { Injectable, Inject } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { ROLE_ACTIONS, RBAC_TOKENS } from '@/features/rbac/domain/constants';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { Role } from '@/features/rbac/domain/models';

@Injectable()
export class GetPaginatedRoleUseCase {
  constructor(
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: any,
  ): Promise<PaginatedResult<Role>> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const roles = await this.roleRepository.findPaginatedList(
          term,
          page,
          limit,
          is_archived,
          manager,
        );
        return roles;
      },
    );
  }
}
