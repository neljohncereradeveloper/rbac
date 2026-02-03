import { RequiredStringValidation } from '@/core/infrastructure/decorators';

export class ChangePasswordDto {
  @RequiredStringValidation({
    field_name: 'New password',
    min_length: 8,
    max_length: 255,
    pattern: /^[\S]+$/, // Allow any non-whitespace characters
    pattern_message: 'Password cannot contain whitespace',
    sanitize: false, // Don't modify passwords
  })
  new_password: string;
}
