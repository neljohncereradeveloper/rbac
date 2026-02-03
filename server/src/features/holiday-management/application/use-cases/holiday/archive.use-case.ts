import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { HolidayBusinessException } from '@/features/holiday-management/domain/exceptions';
import { HolidayRepository } from '@/features/holiday-management/domain/repositories';
import {
  HOLIDAY_ACTIONS,
  HOLIDAY_MANAGEMENT_TOKENS,
  HOLIDAY_MANAGEMENT_DATABASE_MODELS,
} from '@/features/holiday-management/domain/constants';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';

@Injectable()
export class ArchiveHolidayUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(id: number, requestInfo?: RequestInfo): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      HOLIDAY_ACTIONS.ARCHIVE,
      async (manager) => {
        // Validate existence
        const holiday = await this.holidayRepository.findById(id, manager);
        if (!holiday) {
          throw new HolidayBusinessException(
            `Holiday with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Use domain method to archive (soft delete)
        holiday.archive(requestInfo?.user_name || '');

        // Update the entity
        const success = await this.holidayRepository.update(
          id,
          holiday,
          manager,
        );
        if (!success) {
          throw new HolidayBusinessException(
            'Holiday archive failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the archive
        const log = ActivityLog.create({
          action: HOLIDAY_ACTIONS.ARCHIVE,
          entity: HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS,
          details: JSON.stringify({
            id,
            name: holiday.name,
            explanation: `Holiday with ID : ${id} archived by USER : ${
              requestInfo?.user_name || ''
            }`,
            archived_by: requestInfo?.user_name || '',
            archived_at: getPHDateTime(holiday.deleted_at || new Date()),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return true;
      },
    );
  }
}
