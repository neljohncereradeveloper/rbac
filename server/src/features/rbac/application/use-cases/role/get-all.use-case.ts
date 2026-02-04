import { Injectable, Inject } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { ROLE_ACTIONS, RBAC_TOKENS } from '@/features/rbac/domain/constants';
import { Role } from '@/features/rbac/domain/models';

@Injectable()
export class GetAllRolesUseCase {
  constructor(
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(): Promise<Role[]> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const roles = await this.roleRepository.findAll(manager);
        return roles;
      },
    );
  }
}
