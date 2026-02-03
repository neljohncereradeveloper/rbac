import { PaginatedResult } from '@/core/utils/pagination.util';
import { Holiday } from '../models/holiday.model';

export interface HolidayRepository<Context = unknown> {
  /** Create a holiday. */
  create(holiday: Holiday, context: Context): Promise<Holiday>;
  /** Update a holiday. */
  update(id: number, dto: Partial<Holiday>, context: Context): Promise<boolean>;
  /** Find a holiday by ID. */
  findById(id: number, context: Context): Promise<Holiday | null>;
  /** Find paginated list of holidays. */
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Holiday>>;
  /** Find holidays by date range. */
  findByDateRange(
    start_date: Date,
    end_date: Date,
    context: Context,
  ): Promise<Holiday[]>;
  /** Get holidays for combobox/dropdown. */
  combobox(context: Context): Promise<Holiday[]>;
}
