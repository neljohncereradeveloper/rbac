import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { RolePermissionRepository } from '@/features/rbac/domain/repositories';
import { RolePermission } from '@/features/rbac/domain/models';
import {
  ROLE_PERMISSION_ACTIONS,
  RBAC_TOKENS,
} from '@/features/rbac/domain/constants';
import { HTTP_STATUS } from '@/core/domain/constants';
import { RolePermissionBusinessException } from '@/features/rbac/domain/exceptions';

@Injectable()
export class GetRolePermissionsUseCase {
  constructor(
    @Inject(RBAC_TOKENS.ROLE_PERMISSION)
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(role_id: number): Promise<RolePermission[]> {
    if (!role_id || role_id <= 0) {
      throw new RolePermissionBusinessException(
        'Role ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return this.transactionHelper.executeTransaction(
      ROLE_PERMISSION_ACTIONS.FIND_BY_ROLE,
      async (manager) => {
        return this.rolePermissionRepository.findByRoleId(role_id, manager);
      },
    );
  }
}
