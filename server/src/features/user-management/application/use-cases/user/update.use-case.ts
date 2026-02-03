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
import { UpdateUserCommand } from '../../commands/user/update-user.command';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    command: UpdateUserCommand,
    requestInfo?: RequestInfo,
  ): Promise<User | null> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.UPDATE,
      async (manager) => {
        // Validate user existence
        const user = await this.userRepository.findById(id, manager);
        if (!user) {
          throw new UserBusinessException(
            'User not found',
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          { field: 'email' },
          { field: 'first_name' },
          { field: 'middle_name' },
          { field: 'last_name' },
          { field: 'phone' },
          {
            field: 'date_of_birth',
            transform: (val) => (val ? getPHDateTime(val) : null),
          },
          { field: 'is_active' },
          { field: 'is_email_verified' },
          {
            field: 'updated_at',
            transform: (val) => (val ? getPHDateTime(val) : null),
          },
          { field: 'updated_by' },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(user, tracking_config);

        // Use domain model method to update (encapsulates business logic and validation)
        // Note: Username cannot be updated - it is immutable after creation
        user.update({
          email: command.email,
          first_name: command.first_name ?? user.first_name,
          middle_name: command.middle_name ?? user.middle_name,
          last_name: command.last_name ?? user.last_name,
          phone: command.phone ?? user.phone,
          date_of_birth: command.date_of_birth ?? user.date_of_birth,
          is_active: command.is_active ?? user.is_active,
          is_email_verified:
            command.is_email_verified ?? user.is_email_verified,
          updated_by: requestInfo?.user_name || null,
        });

        // Update the user in the database
        const success = await this.userRepository.update(id, user, manager);
        if (!success) {
          throw new UserBusinessException(
            'User update failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Retrieve the updated user
        const updated_result = await this.userRepository.findById(id, manager);

        // Capture after state for logging
        const after_state = extractEntityState(updated_result, tracking_config);

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the update with only changed fields (old state and new state)
        const log = ActivityLog.create({
          action: USER_ACTIONS.UPDATE,
          entity: USER_MANAGEMENT_DATABASE_MODELS.USERS,
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
