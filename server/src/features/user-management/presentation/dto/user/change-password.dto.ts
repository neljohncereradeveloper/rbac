import { RequiredStringValidation } from '@/core/infrastructure/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'New password',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 255,
  })
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
