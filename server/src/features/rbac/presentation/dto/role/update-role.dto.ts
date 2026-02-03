import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@/core/infrastructure/decorators';

export class UpdateRoleDto {
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
}
