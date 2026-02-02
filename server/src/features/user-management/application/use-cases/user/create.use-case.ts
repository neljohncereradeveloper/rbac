import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserBusinessException } from '@/features/user-management/domain/exceptions';
import { User } from '@/features/user-management/domain/models';
import { UserRepository } from '@/features/user-management/domain/repositories';
import {
  USER_ACTIONS,
  USER_MANAGEMENT_TOKENS,
  USER_MANAGEMENT_DATABASE_MODELS,
} from '@/features/user-management/domain/constants';
import { CreateUserDto } from '../../dto/user/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(dto: CreateUserDto, requestInfo?: RequestInfo): Promise<User> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.CREATE,
      async (manager) => {
        // Create domain model (validates automatically)
        const new_user = User.create({
          username: dto.username,
          email: dto.email,
          password: dto.password,
          first_name: dto.first_name ?? null,
          middle_name: dto.middle_name ?? null,
          last_name: dto.last_name ?? null,
          phone: dto.phone ?? null,
          date_of_birth: dto.date_of_birth ?? null,
          is_active: dto.is_active ?? true,
          is_email_verified: dto.is_email_verified ?? false,
          created_by: requestInfo?.user_name || null,
        });

        // Persist the entity
        const created_user = await this.userRepository.create(
          new_user,
          manager,
        );

        if (!created_user) {
          throw new UserBusinessException(
            'User creation failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the creation
        const log = ActivityLog.create({
          action: USER_ACTIONS.CREATE,
          entity: USER_MANAGEMENT_DATABASE_MODELS.USERS,
          details: JSON.stringify({
            id: created_user.id,
            username: created_user.username,
            email: created_user.email,
            first_name: created_user.first_name,
            middle_name: created_user.middle_name,
            last_name: created_user.last_name,
            is_active: created_user.is_active,
            is_email_verified: created_user.is_email_verified,
            created_by: requestInfo?.user_name || '',
            created_at: getPHDateTime(created_user.created_at),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return created_user;
      },
    );
  }
}
