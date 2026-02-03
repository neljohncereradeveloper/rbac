import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@/core/infrastructure/decorators';

export class UpdatePermissionDto {
  @RequiredStringValidation({
    field_name: 'Permission name',
    min_length: 2,
    max_length: 255,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Permission name can only contain letters, numbers, spaces, and basic punctuation',
  })
  name: string;

  @RequiredStringValidation({
    field_name: 'Resource',
    min_length: 1,
    max_length: 100,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Resource must contain only letters, numbers, and underscores',
  })
  resource: string;

  @RequiredStringValidation({
    field_name: 'Action',
    min_length: 1,
    max_length: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Action must contain only letters, numbers, and underscores',
  })
  action: string;

  @OptionalStringValidation({
    field_name: 'Description',
    max_length: 500,
    pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
    pattern_message:
      'Description can only contain letters, numbers, spaces, and basic punctuation',
  })
  description?: string | null;
}
