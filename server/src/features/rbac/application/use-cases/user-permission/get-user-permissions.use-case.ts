import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { UserPermissionRepository } from '@/features/rbac/domain/repositories';
import { UserPermission } from '@/features/rbac/domain/models';
import {
  USER_PERMISSION_ACTIONS,
  RBAC_TOKENS,
} from '@/features/rbac/domain/constants';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserPermissionBusinessException } from '@/features/rbac/domain/exceptions';

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(
    @Inject(RBAC_TOKENS.USER_PERMISSION)
    private readonly userPermissionRepository: UserPermissionRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(user_id: number): Promise<UserPermission[]> {
    if (!user_id || user_id <= 0) {
      throw new UserPermissionBusinessException(
        'User ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return this.transactionHelper.executeTransaction(
      USER_PERMISSION_ACTIONS.FIND_BY_USER_ID,
      async (manager) => {
        return this.userPermissionRepository.findByUserId(user_id, manager);
      },
    );
  }
}
