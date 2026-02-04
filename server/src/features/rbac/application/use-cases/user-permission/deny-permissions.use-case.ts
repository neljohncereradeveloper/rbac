import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserPermissionBusinessException } from '@/features/rbac/domain/exceptions';
import { UserPermissionRepository } from '@/features/rbac/domain/repositories';
import {
  USER_PERMISSION_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';
import { DenyPermissionsToUserCommand } from '../../commands/user-permission';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class DenyPermissionsToUserUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.USER_PERMISSION)
    private readonly userPermissionRepository: UserPermissionRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(
    command: DenyPermissionsToUserCommand,
    requestInfo?: RequestInfo,
  ): Promise<void> {
    return this.transactionHelper.executeTransaction(
      USER_PERMISSION_ACTIONS.DENY_TO_USER,
      async (manager) => {
        if (!command.permission_ids || command.permission_ids.length === 0) {
          throw new UserPermissionBusinessException(
            'At least one permission ID is required.',
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        // Get current denied permission IDs (before state)
        const before_denied_permissions =
          await this.userPermissionRepository.findDeniedByUserId(
            command.user_id,
            manager,
          );
        const before_denied_ids = before_denied_permissions.map(
          (p) => p.permission_id,
        );

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          {
            field: 'denied_permission_ids',
            transform: (val) => (Array.isArray(val) ? [...val].sort() : []),
          },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(
          { denied_permission_ids: before_denied_ids },
          tracking_config,
        );

        // Deny permissions to user (is_allowed: false)
        // If replace is true, remove all existing overrides first, then deny new ones
        if (command.replace) {
          await this.userPermissionRepository.removeFromUser(
            command.user_id,
            [],
            manager,
          );
        }
        await this.userPermissionRepository.denyToUser(
          command.user_id,
          command.permission_ids,
          manager,
        );

        // Get updated denied permission IDs (after state)
        const after_denied_permissions =
          await this.userPermissionRepository.findDeniedByUserId(
            command.user_id,
            manager,
          );
        const after_denied_ids = after_denied_permissions.map(
          (p) => p.permission_id,
        );

        // Capture after state for logging
        const after_state = extractEntityState(
          { denied_permission_ids: after_denied_ids },
          tracking_config,
        );

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the denial with change tracking
        const log = ActivityLog.create({
          action: USER_PERMISSION_ACTIONS.DENY_TO_USER,
          entity: RBAC_DATABASE_MODELS.USER_PERMISSIONS,
          details: JSON.stringify({
            user_id: command.user_id,
            changed_fields: changed_fields,
            is_allowed: false,
            denied_by: requestInfo?.user_name || '',
            denied_at: getPHDateTime(new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
