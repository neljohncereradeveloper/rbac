import { RequiredStringValidation } from '@/core/infrastructure/decorators';
import { OptionalStringValidation } from '@/core/infrastructure/decorators';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsDateStringCustom,
  transformDateString,
} from '@/core/utils/date.util';

export class CreateHolidayDto {
  @RequiredStringValidation({
    field_name: 'Holiday name',
    min_length: 0,
    max_length: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?'"]*$/,
    pattern_message:
      'Holiday name can only contain letters, numbers, spaces, and basic punctuation',
  })
  name: string;

  @Transform(({ value }) => transformDateString(value))
  @IsDateStringCustom({ message: 'Holiday date must be a valid date' })
  date: Date;

  @RequiredStringValidation({
    field_name: 'Holiday type',
    min_length: 1,
    max_length: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Holiday type must contain only letters, numbers, and underscores',
  })
  type: string;

  @OptionalStringValidation({
    field_name: 'Description',
    max_length: 500,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?'"]*$/,
    pattern_message:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
  })
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  is_recurring?: boolean;
}
