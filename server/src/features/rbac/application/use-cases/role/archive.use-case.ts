import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
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
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';

@Injectable()
export class ArchiveRoleUseCase {
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
      ROLE_ACTIONS.ARCHIVE,
      async (manager) => {
        // Validate existence
        const role = await this.roleRepository.findById(id, manager);
        if (!role) {
          throw new RoleBusinessException(
            `Role with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Use domain method to archive (soft delete)
        role.archive(requestInfo?.user_name || '');

        // Update the entity
        const success = await this.roleRepository.update(id, role, manager);
        if (!success) {
          throw new RoleBusinessException(
            'Role archive failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the archive
        const log = ActivityLog.create({
          action: ROLE_ACTIONS.ARCHIVE,
          entity: RBAC_DATABASE_MODELS.ROLES,
          details: JSON.stringify({
            id,
            name: role.name,
            explanation: `Role with ID : ${id} archived by USER : ${requestInfo?.user_name || ''
              }`,
            archived_by: requestInfo?.user_name || '',
            archived_at: getPHDateTime(role.deleted_at || new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return true;
      },
    );
  }
}
