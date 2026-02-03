import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@/core/infrastructure/decorators';
import { IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @RequiredStringValidation({
    field_name: 'Role name',
    min_length: 2,
    max_length: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Role name can only contain letters, numbers, spaces, and basic punctuation',
  })
  name: string;

  @OptionalStringValidation({
    field_name: 'Description',
    max_length: 500,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
  })
  description?: string | null;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) {
      return value.map((v) => Number(v)).filter((v) => !isNaN(v));
    }
    return [Number(value)].filter((v) => !isNaN(v));
  })
  permission_ids?: number[];
}
