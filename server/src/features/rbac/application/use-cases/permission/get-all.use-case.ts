import { Injectable, Inject } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import {
  PERMISSION_ACTIONS,
  RBAC_TOKENS,
} from '@/features/rbac/domain/constants';
import { Permission } from '@/features/rbac/domain/models';

@Injectable()
export class GetAllPermissionsUseCase {
  constructor(
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(): Promise<Permission[]> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const permissions = await this.permissionRepository.findAll(manager);
        return permissions;
      },
    );
  }
}
