import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@/core/infrastructure/decorators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'Create User',
    minLength: 1,
    maxLength: 100,
    pattern: "^[a-zA-Z0-9\\s\\-_&.,()']+$",
  })
  @RequiredStringValidation({
    field_name: 'Permission name',
    min_length: 2,
    max_length: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Permission name can only contain letters, numbers, spaces, and basic punctuation',
  })
  name: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'user',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9_]+$',
  })
  @RequiredStringValidation({
    field_name: 'Resource',
    min_length: 1,
    max_length: 100,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Resource must contain only letters, numbers, and underscores',
  })
  resource: string;

  @ApiProperty({
    description: 'Action name',
    example: 'create',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_]+$',
  })
  @RequiredStringValidation({
    field_name: 'Action',
    min_length: 1,
    max_length: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Action must contain only letters, numbers, and underscores',
  })
  action: string;

  @ApiPropertyOptional({
    description: 'Description of the permission',
    example: 'Allows creating new users',
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
}
