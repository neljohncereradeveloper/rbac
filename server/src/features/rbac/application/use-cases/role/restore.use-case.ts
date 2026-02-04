import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { RoleBusinessException } from '@/features/rbac/domain/exceptions';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import {
  ROLE_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';

@Injectable()
export class RestoreRoleUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(id: number, requestInfo?: RequestInfo): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.RESTORE,
      async (manager) => {
        // Validate existence
        const role = await this.roleRepository.findById(id, manager);
        if (!role) {
          throw new RoleBusinessException(
            `Role with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Use domain method to restore
        role.restore();

        console.log('role', role);

        // Update the entity
        const success = await this.roleRepository.update(id, role, manager);
        if (!success) {
          throw new RoleBusinessException(
            'Role restore failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the restore
        const log = ActivityLog.create({
          action: ROLE_ACTIONS.RESTORE,
          entity: RBAC_DATABASE_MODELS.ROLES,
          details: JSON.stringify({
            id,
            name: role.name,
            explanation: `Role with ID : ${id} restored by USER : ${requestInfo?.user_name || ''
              }`,
            restored_by: requestInfo?.user_name || '',
            restored_at: getPHDateTime(new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return true;
      },
    );
  }
}
