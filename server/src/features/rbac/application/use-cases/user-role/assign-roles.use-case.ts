import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserRoleBusinessException } from '@/features/rbac/domain/exceptions';
import { UserRoleRepository } from '@/features/rbac/domain/repositories';
import {
  USER_ROLE_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';
import { AssignRolesToUserCommand } from '../../commands/user-role';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class AssignRolesToUserUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.USER_ROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(
    command: AssignRolesToUserCommand,
    requestInfo?: RequestInfo,
  ): Promise<void> {
    return this.transactionHelper.executeTransaction(
      USER_ROLE_ACTIONS.ASSIGN_TO_USER,
      async (manager) => {
        if (!command.role_ids || command.role_ids.length === 0) {
          throw new UserRoleBusinessException(
            'At least one role ID is required.',
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        // Get current role IDs (before state)
        const before_role_ids =
          await this.userRoleRepository.findRoleIdsByUserId(
            command.user_id,
            manager,
          );

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          {
            field: 'role_ids',
            transform: (val) => (Array.isArray(val) ? [...val].sort() : []),
          },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(
          { role_ids: before_role_ids },
          tracking_config,
        );

        // Assign roles to user
        await this.userRoleRepository.assignToUser(
          command.user_id,
          command.role_ids,
          manager,
          command.replace,
        );

        // Get updated role IDs (after state)
        const after_role_ids =
          await this.userRoleRepository.findRoleIdsByUserId(
            command.user_id,
            manager,
          );

        // Capture after state for logging
        const after_state = extractEntityState(
          { role_ids: after_role_ids },
          tracking_config,
        );

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the assignment with change tracking
        const log = ActivityLog.create({
          action: USER_ROLE_ACTIONS.ASSIGN_TO_USER,
          entity: RBAC_DATABASE_MODELS.USER_ROLES,
          details: JSON.stringify({
            user_id: command.user_id,
            changed_fields: changed_fields,
            replace: command.replace || false,
            assigned_by: requestInfo?.user_name || '',
            assigned_at: getPHDateTime(new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
