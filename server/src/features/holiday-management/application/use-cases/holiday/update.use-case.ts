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
import { UpdateHolidayCommand } from '../../commands/holiday/update-holiday.command';
import {
  getChangedFields,
  extractEntityState,
  FieldExtractorConfig,
} from '@/core/utils/change-tracking.util';

@Injectable()
export class UpdateHolidayUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    command: UpdateHolidayCommand,
    requestInfo?: RequestInfo,
  ): Promise<Holiday | null> {
    return this.transactionHelper.executeTransaction(
      HOLIDAY_ACTIONS.UPDATE,
      async (manager) => {
        // Validate holiday existence
        const holiday = await this.holidayRepository.findById(id, manager);
        if (!holiday) {
          throw new HolidayBusinessException(
            'Holiday not found',
            HTTP_STATUS.NOT_FOUND,
          );
        }

        // Define fields to track for change logging
        const tracking_config: FieldExtractorConfig[] = [
          { field: 'name' },
          {
            field: 'date',
            transform: (val) => (val ? getPHDateTime(val) : null),
          },
          { field: 'type' },
          { field: 'description' },
          { field: 'is_recurring' },
          {
            field: 'updated_at',
            transform: (val) => (val ? getPHDateTime(val) : null),
          },
          { field: 'updated_by' },
        ];

        // Capture before state for logging
        const before_state = extractEntityState(holiday, tracking_config);

        // Use domain model method to update (encapsulates business logic and validation)
        holiday.update({
          name: command.name,
          date: command.date,
          type: command.type,
          description: command.description ?? null,
          is_recurring: command.is_recurring ?? false,
          updated_by: requestInfo?.user_name || null,
        });

        // Update the holiday in the database
        const success = await this.holidayRepository.update(
          id,
          holiday,
          manager,
        );
        if (!success) {
          throw new HolidayBusinessException(
            'Holiday update failed',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          );
        }

        // Retrieve the updated holiday
        const updated_result = await this.holidayRepository.findById(
          id,
          manager,
        );

        // Capture after state for logging
        const after_state = extractEntityState(updated_result, tracking_config);

        // Get only the changed fields with old and new states
        const changed_fields = getChangedFields(before_state, after_state);

        // Log the update with only changed fields (old state and new state)
        const log = ActivityLog.create({
          action: HOLIDAY_ACTIONS.UPDATE,
          entity: HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS,
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
