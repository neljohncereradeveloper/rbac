import { RequiredStringValidation } from '@/core/infrastructure/decorators';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Login DTO
 * Used for user authentication
 */
export class LoginDto {
  @ApiProperty({
    description: 'Username or Email',
    example: 'john_doe',
    minLength: 3,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9_]+$',
  })
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

  @ApiProperty({
    description: 'Password',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 255,
  })
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
