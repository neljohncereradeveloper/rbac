import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { HolidayRepository } from '@/features/holiday-management/domain/repositories';
import {
  HOLIDAY_ACTIONS,
  HOLIDAY_MANAGEMENT_TOKENS,
} from '@/features/holiday-management/domain/constants';
import { Holiday } from '@/features/holiday-management/domain/models';
import { HTTP_STATUS } from '@/core/domain/constants';
import { HolidayBusinessException } from '@/features/holiday-management/domain/exceptions';

@Injectable()
export class GetHolidayByIdUseCase {
  constructor(
    @Inject(HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(id: number): Promise<Holiday> {
    return this.transactionHelper.executeTransaction(
      HOLIDAY_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const holiday = await this.holidayRepository.findById(id, manager);
        if (!holiday) {
          throw new HolidayBusinessException(
            `Holiday with ID ${id} not found.`,
            HTTP_STATUS.NOT_FOUND,
          );
        }
        return holiday;
      },
    );
  }
}
