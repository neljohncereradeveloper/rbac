import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@/core/infrastructure/decorators';
import { IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Administrator',
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z0-9\\s\\-_&.,()']+$",
  })
  @RequiredStringValidation({
    field_name: 'Role name',
    min_length: 2,
    max_length: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Role name can only contain letters, numbers, spaces, and basic punctuation',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Full system access',
    maxLength: 1000,
  })
  @OptionalStringValidation({
    field_name: 'Description',
    max_length: 500,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to the role',
    example: [1, 2, 3],
    type: [Number],
  })
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
