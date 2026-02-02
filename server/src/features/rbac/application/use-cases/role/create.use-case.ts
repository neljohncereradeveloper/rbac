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
import { CreateRoleDto } from '../../dto/role/create-role.dto';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(dto: CreateRoleDto, requestInfo?: RequestInfo): Promise<Role> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.CREATE,
      async (manager) => {
        // Create domain model (validates automatically)
        const new_role = Role.create({
          name: dto.name,
          description: dto.description ?? null,
          created_by: requestInfo?.user_name || null,
        });

        // Persist the entity
        const created_role = await this.roleRepository.create(
          new_role,
          manager,
          dto.permission_ids,
        );

        if (!created_role) {
          throw new RoleBusinessException(
            'Role creation failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the creation
        const log = ActivityLog.create({
          action: ROLE_ACTIONS.CREATE,
          entity: RBAC_DATABASE_MODELS.ROLES,
          details: JSON.stringify({
            id: created_role.id,
            name: created_role.name,
            description: created_role.description,
            created_by: requestInfo?.user_name || '',
            created_at: getPHDateTime(created_role.created_at),
            permission_ids: dto.permission_ids || [],
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return created_role;
      },
    );
  }
}
