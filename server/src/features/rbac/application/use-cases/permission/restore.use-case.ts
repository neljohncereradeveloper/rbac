import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { PermissionBusinessException } from '@/features/rbac/domain/exceptions';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import {
  PERMISSION_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';

@Injectable()
export class RestorePermissionUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(
    id: number,
    requestInfo?: RequestInfo,
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.RESTORE,
      async (manager) => {
        // Validate existence
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

        // Use domain method to restore
        permission.restore();

        // Update the entity
        const success = await this.permissionRepository.update(
          id,
          permission,
          manager,
        );
        if (!success) {
          throw new PermissionBusinessException(
            'Permission restore failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the restore
        const log = ActivityLog.create({
          action: PERMISSION_ACTIONS.RESTORE,
          entity: RBAC_DATABASE_MODELS.PERMISSIONS,
          details: JSON.stringify({
            id,
            name: permission.name,
            explanation: `Permission with ID : ${id} restored by USER : ${requestInfo?.user_name || ''
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
