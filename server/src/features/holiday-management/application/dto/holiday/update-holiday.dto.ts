/**
 * DTO for updating a holiday
 * Application layer DTO - simple type definition without validation
 */
export interface UpdateHolidayDto {
  name: string;
  date: Date;
  type: string;
  description?: string | null;
  is_recurring?: boolean;
}
