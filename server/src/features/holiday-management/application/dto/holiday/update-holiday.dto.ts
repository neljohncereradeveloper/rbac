export class UpdateHolidayDto {
  name: string;
  date: Date;
  type: string;
  description?: string | null;
  is_recurring?: boolean;
}
