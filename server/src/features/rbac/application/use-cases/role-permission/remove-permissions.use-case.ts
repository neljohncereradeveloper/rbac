import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import {
  RoleBusinessException,
  RolePermissionBusinessException,
} from '@/features/rbac/domain/exceptions';
import {
  RoleRepository,
  RolePermissionRepository,
} from '@/features/rbac/domain/repositories';
import {
  ROLE_PERMISSION_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';
import { RemovePermissionsFromRoleCommand } from '../../commands/role-permission';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class RemovePermissionsFromRoleUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(RBAC_TOKENS.ROLE_PERMISSION)
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(
    command: RemovePermissionsFromRoleCommand,
    requestInfo?: RequestInfo,
  ): Promise<void> {
    return this.transactionHelper.executeTransaction(
      ROLE_PERMISSION_ACTIONS.REMOVE_FROM_ROLE,
      async (manager) => {
        // Validate role existence
        const role = await this.roleRepository.findById(
          command.role_id,
          manager,
        );
        if (!role) {
          throw new RoleBusinessException(
            `Role with ID ${command.role_id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }

        if (!command.permission_ids || command.permission_ids.length === 0) {
          throw new RolePermissionBusinessException(
            'At least one permission ID is required.',
            HTTP_STATUS.BAD_REQUEST,
          );
        }

        // Get current permission IDs (before state)
        const before_permission_ids =
          await this.rolePermissionRepository.findPermissionIdsByRoleId(
            command.role_id,
            manager,
          );

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          {
            field: 'permission_ids',
            transform: (val) => (Array.isArray(val) ? [...val].sort() : []),
          },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(
          { permission_ids: before_permission_ids },
          tracking_config,
        );

        // Remove permissions from role
        await this.rolePermissionRepository.removeFromRole(
          command.role_id,
          command.permission_ids,
          manager,
        );

        // Get updated permission IDs (after state)
        const after_permission_ids =
          await this.rolePermissionRepository.findPermissionIdsByRoleId(
            command.role_id,
            manager,
          );

        // Capture after state for logging
        const after_state = extractEntityState(
          { permission_ids: after_permission_ids },
          tracking_config,
        );

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the removal with change tracking
        const log = ActivityLog.create({
          action: ROLE_PERMISSION_ACTIONS.REMOVE_FROM_ROLE,
          entity: RBAC_DATABASE_MODELS.ROLE_PERMISSIONS,
          details: JSON.stringify({
            role_id: command.role_id,
            role_name: role.name,
            changed_fields: changed_fields,
            removed_by: requestInfo?.user_name || '',
            removed_at: getPHDateTime(new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);
      },
    );
  }
}
