/**
 * Command for creating a holiday
 * Application layer command - simple type definition without validation
 */
export interface CreateHolidayCommand {
  name: string;
  date: Date;
  type: string;
  description?: string | null;
  is_recurring?: boolean;
}
