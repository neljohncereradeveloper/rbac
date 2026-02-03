import { RequiredStringValidation } from '@/core/infrastructure/decorators';

/**
 * Login DTO
 * Used for user authentication
 */
export class LoginDto {
  @RequiredStringValidation({
    field_name: 'Username or Email',
    min_length: 3,
    max_length: 100,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Username must contain only letters, numbers, and underscores',
    sanitize: true, // Lowercase usernames to prevent case-sensitivity issues
  })
  username_or_email: string;

  @RequiredStringValidation({
    field_name: 'Password',
    min_length: 8,
    max_length: 255,
    pattern: /^[\S]+$/, // Allow any non-whitespace characters
    pattern_message: 'Password cannot contain whitespace',
    sanitize: false, // Don't modify passwords
  })
  password: string;
}
