import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { ROLE_ACTIONS, RBAC_TOKENS } from '@/features/rbac/domain/constants';
import { Role } from '@/features/rbac/domain/models';
import { HTTP_STATUS } from '@/core/domain/constants';
import { RoleBusinessException } from '@/features/rbac/domain/exceptions';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(id: number, context: any): Promise<Role> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const role = await this.roleRepository.findById(id, manager);
        if (!role) {
          throw new RoleBusinessException(
            `Role with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }
        return role;
      },
    );
  }
}
