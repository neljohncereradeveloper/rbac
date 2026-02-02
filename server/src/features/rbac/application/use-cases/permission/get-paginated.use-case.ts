import { Injectable, Inject } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import {
  PERMISSION_ACTIONS,
  RBAC_TOKENS,
} from '@/features/rbac/domain/constants';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { Permission } from '@/features/rbac/domain/models';

@Injectable()
export class GetPaginatedPermissionUseCase {
  constructor(
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Permission>> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const permissions = await this.permissionRepository.findPaginatedList(
          term,
          page,
          limit,
          is_archived,
          manager,
        );
        return permissions;
      },
    );
  }
}
