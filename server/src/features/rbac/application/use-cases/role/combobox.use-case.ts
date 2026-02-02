import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { ROLE_ACTIONS, RBAC_TOKENS } from '@/features/rbac/domain/constants';

@Injectable()
export class ComboboxRoleUseCase {
  constructor(
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) { }

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.COMBOBOX,
      async (manager) => {
        const roles = await this.roleRepository.combobox(manager);
        return roles.map((role: { name: string }) => ({
          value: role.name || '',
          label: role.name
            ? role.name.charAt(0).toUpperCase() +
            role.name.slice(1).toLowerCase()
            : '',
        }));
      },
    );
  }
}
