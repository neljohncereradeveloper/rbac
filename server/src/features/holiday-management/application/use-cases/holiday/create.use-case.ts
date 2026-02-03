import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepository } from '@/core/domain/repositories';
import { RequestInfo } from '@/core/utils/request-info.util';
import { getPHDateTime } from '@/core/utils/date.util';
import { ActivityLog } from '@/core/domain/models';
import { TransactionPort } from '@/core/domain/ports';
import { HTTP_STATUS } from '@/core/domain/constants';
import { HolidayBusinessException } from '@/features/holiday-management/domain/exceptions';
import { Holiday } from '@/features/holiday-management/domain/models';
import { HolidayRepository } from '@/features/holiday-management/domain/repositories';
import {
  HOLIDAY_ACTIONS,
  HOLIDAY_MANAGEMENT_TOKENS,
  HOLIDAY_MANAGEMENT_DATABASE_MODELS,
} from '@/features/holiday-management/domain/constants';
import { CreateHolidayCommand } from '../../commands/holiday/create-holiday.command';

@Injectable()
export class CreateHolidayUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    command: CreateHolidayCommand,
    requestInfo?: RequestInfo,
  ): Promise<Holiday> {
    return this.transactionHelper.executeTransaction(
      HOLIDAY_ACTIONS.CREATE,
      async (manager) => {
        // Create domain model (validates automatically)
        const new_holiday = Holiday.create({
          name: command.name,
          date: command.date,
          type: command.type,
          description: command.description ?? null,
          is_recurring: command.is_recurring ?? false,
          created_by: requestInfo?.user_name || null,
        });

        // Persist the entity
        const created_holiday = await this.holidayRepository.create(
          new_holiday,
          manager,
        );

        if (!created_holiday) {
          throw new HolidayBusinessException(
            'Holiday creation failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Log the creation
        const log = ActivityLog.create({
          action: HOLIDAY_ACTIONS.CREATE,
          entity: HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS,
          details: JSON.stringify({
            id: created_holiday.id,
            name: created_holiday.name,
            date: getPHDateTime(created_holiday.date),
            type: created_holiday.type,
            description: created_holiday.description,
            is_recurring: created_holiday.is_recurring,
            created_by: requestInfo?.user_name || '',
            created_at: getPHDateTime(created_holiday.created_at),
          }),
          request_info: requestInfo || { user_name: '' },
        });
        await this.activityLogRepository.create(log, manager);

        return created_holiday;
      },
    );
  }
}
