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
import { CreatePermissionDto } from '../../dto/permission/create-permission.dto';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    dto: CreatePermissionDto,
    requestInfo?: RequestInfo,
  ): Promise<Permission> {
    return this.transactionHelper.executeTransaction(
      PERMISSION_ACTIONS.CREATE,
      async (manager) => {
        // Create domain model (validates automatically)
        const new_permission = Permission.create({
          name: dto.name,
          resource: dto.resource,
          action: dto.action,
          description: dto.description ?? null,
          created_by: requestInfo?.user_name || null,
        });

        // Persist the entity
        const created_permission = await this.permissionRepository.create(
          new_permission,
          manager,
        );

        if (!created_permission) {
          throw new PermissionBusinessException(
            'Permission creation failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the creation
        const log = ActivityLog.create({
          action: PERMISSION_ACTIONS.CREATE,
          entity: RBAC_DATABASE_MODELS.PERMISSIONS,
          details: JSON.stringify({
            id: created_permission.id,
            name: created_permission.name,
            resource: created_permission.resource,
            action: created_permission.action,
            description: created_permission.description,
            created_by: requestInfo?.user_name || '',
            created_at: getPHDateTime(created_permission.created_at),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return created_permission;
      },
    );
  }
}
