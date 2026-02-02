import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { PermissionBusinessException } from '@/features/rbac/domain/exceptions';
import { Permission } from '@/features/rbac/domain/models';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import {
  PERMISSION_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';
import { UpdatePermissionDto } from '../../dto/permission/update-permission.dto';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class UpdatePermissionUseCase {
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
    dto: UpdatePermissionDto,
    requestInfo?: RequestInfo,
  ): Promise<Permission | null> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.UPDATE,
      async (manager) => {
        // Validate permission existence
        const permission = await this.permissionRepository.findById(
          id,
          manager,
        );
        if (!permission) {
          throw new PermissionBusinessException(
            'Permission not found',
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          { field: 'name' },
          { field: 'resource' },
          { field: 'action' },
          { field: 'description' },
          {
            field: 'updated_at',
            transform: (val) => (val ? getPHDateTime(val) : null),
          },
          { field: 'updated_by' },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(permission, tracking_config);

        // Use domain model method to update (encapsulates business logic and validation)
        permission.update({
          name: dto.name,
          resource: dto.resource,
          action: dto.action,
          description: dto.description ?? null,
          updated_by: requestInfo?.user_name || null,
        });

        // Update the permission in the database
        const success = await this.permissionRepository.update(
          id,
          permission,
          manager,
        );
        if (!success) {
          throw new PermissionBusinessException(
            'Permission update failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Retrieve the updated permission
        const updated_result = await this.permissionRepository.findById(
          id,
          manager,
        );

        // Capture after state for logging
        const after_state = extractEntityState(
          updated_result,
          tracking_config,
        );

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the update with only changed fields (old state and new state)
        const log = ActivityLog.create({
          action: PERMISSION_ACTIONS.UPDATE,
          entity: RBAC_DATABASE_MODELS.PERMISSIONS,
          details: JSON.stringify({
            id: updated_result?.id,
            changed_fields: changed_fields,
            updated_by: requestInfo?.user_name || '',
            updated_at: getPHDateTime(
              updated_result?.updated_at || new Date(),
            ),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return updated_result;
      },
    );
  }
}
