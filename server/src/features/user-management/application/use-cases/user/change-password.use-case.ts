import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { PasswordUtil } from '@/core/utils/password.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { UserBusinessException } from '@/features/user-management/domain/exceptions';
import { UserRepository } from '@/features/user-management/domain/repositories';
import {
  USER_ACTIONS,
  USER_MANAGEMENT_TOKENS,
  USER_MANAGEMENT_DATABASE_MODELS,
} from '@/features/user-management/domain/constants';
import { ChangePasswordCommand } from '../../commands/user/change-password.command';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    command: ChangePasswordCommand,
    requestInfo?: RequestInfo,
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.CHANGE_PASSWORD,
      async (manager) => {
        // Validate user existence
        const user = await this.userRepository.findById(
          command.user_id,
          manager,
        );
        if (!user) {
          throw new UserBusinessException(
            `User with ID ${command.user_id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Hash new password before changing
        const hashedPassword = await PasswordUtil.hash(command.new_password);

        // Use domain method to change password (validates automatically)
        user.changePassword(hashedPassword, requestInfo?.user_name || null);

        // Update the user in the database
        const success = await this.userRepository.changePassword(
          command.user_id,
          user,
          manager,
        );
        if (!success) {
          throw new UserBusinessException(
            'Password change failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the password change
        const log = ActivityLog.create({
          action: USER_ACTIONS.CHANGE_PASSWORD,
          entity: USER_MANAGEMENT_DATABASE_MODELS.USERS,
          details: JSON.stringify({
            user_id: command.user_id,
            username: user.username,
            explanation: `Password changed for user with ID : ${command.user_id} by USER : ${
              requestInfo?.user_name || ''
            }`,
            change_password_by: requestInfo?.user_name || '',
            change_password_at: getPHDateTime(
              user.change_password_at || new Date(),
            ),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return true;
      },
    );
  }
}
