import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import {
  PERMISSION_ACTIONS,
  RBAC_TOKENS,
} from '@/features/rbac/domain/constants';
import { Permission } from '@/features/rbac/domain/models';
import { HTTP_STATUS } from '@/core/domain/constants';
import { PermissionBusinessException } from '@/features/rbac/domain/exceptions';

@Injectable()
export class GetPermissionByIdUseCase {
  constructor(
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(id: number, context: any): Promise<Permission> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const permission = await this.permissionRepository.findById(
          id,
          manager,
        );
        if (!permission) {
          throw new PermissionBusinessException(
            `Permission with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }
        return permission;
      },
    );
  }
}
