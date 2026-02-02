import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import {
  PERMISSION_ACTIONS,
  RBAC_TOKENS,
} from '@/features/rbac/domain/constants';

@Injectable()
export class ComboboxPermissionUseCase {
  constructor(
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.COMBOBOX,
      async (manager) => {
        const permissions = await this.permissionRepository.combobox(manager);
        return permissions.map((permission: { name: string }) => ({
          value: permission.name || '',
          label: permission.name
            ? permission.name.charAt(0).toUpperCase() +
              permission.name.slice(1).toLowerCase()
            : '',
        }));
      },
    );
  }
}
