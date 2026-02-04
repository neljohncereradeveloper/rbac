import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { UserRoleRepository } from '@/features/rbac/domain/repositories';
import { UserRole } from '@/features/rbac/domain/models';
import { USER_ROLE_ACTIONS, RBAC_TOKENS } from '@/features/rbac/domain/constants';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserRoleBusinessException } from '@/features/rbac/domain/exceptions';

@Injectable()
export class GetUserRolesUseCase {
  constructor(
    @Inject(RBAC_TOKENS.USER_ROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(user_id: number): Promise<UserRole[]> {
    if (!user_id || user_id <= 0) {
      throw new UserRoleBusinessException(
        'User ID is required and must be a positive number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return this.transactionHelper.executeTransaction(
      USER_ROLE_ACTIONS.FIND_BY_USER_ID,
      async (manager) => {
        return this.userRoleRepository.findByUserId(user_id, manager);
      },
    );
  }
}
