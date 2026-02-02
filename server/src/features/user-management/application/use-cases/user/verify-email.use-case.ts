import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
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
import { VerifyEmailDto } from '../../dto/user/verify-email.dto';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) { }

  async execute(
    dto: VerifyEmailDto,
    requestInfo?: RequestInfo,
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.VERIFY_EMAIL,
      async (manager) => {
        // Validate user existence
        const user = await this.userRepository.findById(dto.user_id, manager);
        if (!user) {
          throw new UserBusinessException(
            `User with ID ${dto.user_id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Use domain method to verify email (validates automatically)
        // Email verification is done via email link, so no user_name is required
        user.verifyEmail(null);

        // Update the user in the database
        const success = await this.userRepository.update(
          dto.user_id,
          user,
          manager,
        );
        if (!success) {
          throw new UserBusinessException(
            'Email verification failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the email verification
        // Email verification is system-initiated via email link (no login required)
        const log = ActivityLog.create({
          action: USER_ACTIONS.VERIFY_EMAIL,
          entity: USER_MANAGEMENT_DATABASE_MODELS.USERS,
          details: JSON.stringify({
            user_id: dto.user_id,
            username: user.username,
            email: user.email,
            explanation: `Email verified for user with ID : ${dto.user_id} via email verification link`,
            verified_at: getPHDateTime(user.is_email_verified_at || new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return true;
      },
    );
  }
}
