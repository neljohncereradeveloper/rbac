import {
  RequiredStringValidation,
  OptionalStringValidation,
} from '@/core/infrastructure/decorators';
import { IsOptional, IsBoolean, IsEmail, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  IsDateStringCustom,
  transformDateString,
} from '@/core/utils/date.util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
    minLength: 3,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9_]+$',
  })
  @RequiredStringValidation({
    field_name: 'Username',
    min_length: 3,
    max_length: 100,
    pattern: /^[a-zA-Z0-9_]+$/,
    pattern_message:
      'Username must contain only letters, numbers, and underscores',
    sanitize: true, // Lowercase usernames to prevent case-sensitivity issues
  })
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    minLength: 1,
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Length(1, 255, {
    message: 'Email must be between 1 and 255 characters',
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return '';
    }
    return String(value).trim().toLowerCase();
  })
  email: string;

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

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
    maxLength: 100,
  })
  @OptionalStringValidation({
    field_name: 'First name',
    max_length: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    pattern_message:
      'First name can only contain letters, spaces, hyphens, apostrophes, commas, and periods',
  })
  first_name?: string | null;

  @ApiPropertyOptional({
    description: 'Middle name',
    example: 'Michael',
    maxLength: 100,
  })
  @OptionalStringValidation({
    field_name: 'Middle name',
    max_length: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    pattern_message:
      'Middle name can only contain letters, spaces, hyphens, apostrophes, commas, and periods',
  })
  middle_name?: string | null;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
    maxLength: 100,
  })
  @OptionalStringValidation({
    field_name: 'Last name',
    max_length: 100,
    pattern: /^[a-zA-Z\s\-'.,]+$/,
    pattern_message:
      'Last name can only contain letters, spaces, hyphens, apostrophes, commas, and periods',
  })
  last_name?: string | null;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1-555-123-4567',
    maxLength: 20,
  })
  @OptionalStringValidation({
    field_name: 'Phone',
    max_length: 20,
    pattern: /^[\d\s\-+()]+$/,
    pattern_message:
      'Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses',
  })
  phone?: string | null;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-01',
    type: Date,
  })
  @Transform(({ value }) => transformDateString(value))
  @IsOptional()
  @IsDateStringCustom({ message: 'Date of birth must be a valid date' })
  date_of_birth?: Date | null;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the email is verified',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  is_email_verified?: boolean;
}
