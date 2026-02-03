import { Injectable, Inject } from '@nestjs/common';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { HolidayRepository } from '@/features/holiday-management/domain/repositories';
import {
  HOLIDAY_ACTIONS,
  HOLIDAY_MANAGEMENT_TOKENS,
} from '@/features/holiday-management/domain/constants';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { Holiday } from '@/features/holiday-management/domain/models';

@Injectable()
export class GetPaginatedHolidayUseCase {
  constructor(
    @Inject(HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Holiday>> {
    return this.transactionHelper.executeTransaction(
      HOLIDAY_ACTIONS.PAGINATED_LIST,
      async (manager) => {
        const holidays = await this.holidayRepository.findPaginatedList(
          term,
          page,
          limit,
          is_archived,
          manager,
        );
        return holidays;
      },
    );
  }
}
