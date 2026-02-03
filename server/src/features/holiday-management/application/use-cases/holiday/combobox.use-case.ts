import { Inject, Injectable } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { HolidayRepository } from '@/features/holiday-management/domain/repositories';
import {
  HOLIDAY_ACTIONS,
  HOLIDAY_MANAGEMENT_TOKENS,
} from '@/features/holiday-management/domain/constants';

@Injectable()
export class ComboboxHolidayUseCase {
  constructor(
    @Inject(HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(): Promise<{ value: string; label: string }[]> {
    return this.transactionHelper.executeTransaction(
      HOLIDAY_ACTIONS.COMBOBOX,
      async (manager) => {
        const holidays = await this.holidayRepository.combobox(manager);
        return holidays.map((holiday: { name: string }) => ({
          value: holiday.name || '',
          label: holiday.name
            ? holiday.name.charAt(0).toUpperCase() +
              holiday.name.slice(1).toLowerCase()
            : '',
        }));
      },
    );
  }
}
