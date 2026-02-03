import { PaginatedResult } from '@/core/utils/pagination.util';
import { Holiday } from '../models/holiday.model';

export interface HolidayRepository<Context = unknown> {
  /** Create a holiday. */
  create(holiday: Holiday, context: Context): Promise<Holiday>;
  update(
    id: number,
    dto: Partial<Holiday>,
    context: Context,
  ): Promise<boolean>;
  findById(id: number, context: Context): Promise<Holiday | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Holiday>>;
  findByDate(date: Date, context: Context): Promise<Holiday[]>;
  combobox(context: Context): Promise<Holiday[]>;
}
