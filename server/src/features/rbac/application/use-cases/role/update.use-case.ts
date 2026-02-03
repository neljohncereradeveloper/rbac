import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { RoleBusinessException } from '@/features/rbac/domain/exceptions';
import { Role } from '@/features/rbac/domain/models';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import {
  ROLE_ACTIONS,
  RBAC_TOKENS,
  RBAC_DATABASE_MODELS,
} from '@/features/rbac/domain/constants';
import { UpdateRoleCommand } from '../../commands/role/update-role.command';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(
    id: number,
    command: UpdateRoleCommand,
    requestInfo?: RequestInfo,
  ): Promise<Role | null> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.UPDATE,
      async (manager) => {
        // Validate role existence
        const role = await this.roleRepository.findById(id, manager);
        if (!role) {
          throw new RoleBusinessException(
            'Role not found',
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          { field: 'name' },
          { field: 'description' },
          {
            field: 'updated_at',
            transform: (val) => (val ? getPHDateTime(val) : null),
          },
          { field: 'updated_by' },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(role, tracking_config);

        // Use domain model method to update (encapsulates business logic and validation)
        role.update({
          name: command.name,
          description: command.description ?? null,
          updated_by: requestInfo?.user_name || null,
        });

        // Update the role in the database
        const success = await this.roleRepository.update(id, role, manager);
        if (!success) {
          throw new RoleBusinessException(
            'Role update failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Retrieve the updated role
        const updated_result = await this.roleRepository.findById(id, manager);

        // Capture after state for logging
        const after_state = extractEntityState(updated_result, tracking_config);

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the update with only changed fields (old state and new state)
        const log = ActivityLog.create({
          action: ROLE_ACTIONS.UPDATE,
          entity: RBAC_DATABASE_MODELS.ROLES,
          details: JSON.stringify({
            id: updated_result?.id,
            changed_fields: changed_fields,
            updated_by: requestInfo?.user_name || '',
            updated_at: getPHDateTime(updated_result?.updated_at || new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return updated_result;
      },
    );
  }
}
