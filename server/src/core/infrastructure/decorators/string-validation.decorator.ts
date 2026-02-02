import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator';

export interface RequiredStringValidationOptions {
  field_name?: string;
  min_length?: number;
  max_length?: number;
  pattern?: RegExp;
  pattern_message?: string;
  allow_empty?: boolean;
  sanitize?: boolean;
}

/**
 * Reusable validation decorator for required strings with pattern matching
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min_length - Minimum length (default: 1)
 * @param options.max_length - Maximum length (default: 255)
 * @param options.pattern - Regex pattern for validation (default: alphanumeric + basic punctuation)
 * @param options.pattern_message - Custom message for pattern validation
 * @param options.allow_empty - Whether to allow empty strings (default: false)
 * @param options.sanitize - Whether to sanitize the string by trimming (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredStringValidation({ field_name: 'Job title' })
 *   jobTitle: string;
 *
 *   @RequiredStringValidation({
 *     field_name: 'Description',
 *     max_length: 500,
 *     pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
 *     pattern_message: 'Description can only contain letters, numbers, spaces, and basic punctuation'
 *   })
 *   description: string;
 * }
 * ```
 */
export function RequiredStringValidation(
  options: RequiredStringValidationOptions = {},
) {
  const {
    field_name = 'Field',
    min_length = 1,
    max_length = 255,
    pattern = /^[a-zA-Z0-9\s\-_&.,()]+$/,
    pattern_message = `${field_name} can only contain letters, numbers, spaces, and basic punctuation`,
    allow_empty = false,
    sanitize = true,
  } = options;

  // Validate input parameters
  if (min_length < 0) {
    throw new DecoratorValidationException(
      'min_length must be a non-negative number',
      'RequiredStringValidation',
    );
  }
  if (max_length < min_length) {
    throw new DecoratorValidationException(
      'max_length must be greater than or equal to min_length',
      'RequiredStringValidation',
    );
  }
  if (!(pattern instanceof RegExp)) {
    throw new DecoratorValidationException(
      'pattern must be a RegExp',
      'RequiredStringValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add sanitization transformation if enabled
  if (sanitize) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return allow_empty ? null : '';
        }

        // Trim, convert to lowercase, and return
        const trimmed = String(value).trim();
        const lowercased = trimmed.toLowerCase();
        return lowercased === '' ? (allow_empty ? null : '') : lowercased;
      }),
    );
  }

  // Add IsNotEmpty only if empty strings are not allowed
  if (!allow_empty) {
    decorators.push(IsNotEmpty({ message: `${field_name} is required` }));
  }

  // Add string validation
  decorators.push(IsString({ message: `${field_name} must be a string` }));

  // Add length validation
  decorators.push(
    Length(min_length, max_length, {
      message: `${field_name} must be between ${min_length} and ${max_length} characters`,
    }),
  );

  // Add pattern validation
  decorators.push(Matches(pattern, { message: pattern_message }));

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional strings with pattern matching
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min_length - Minimum length (default: 1)
 * @param options.max_length - Maximum length (default: 255)
 * @param options.pattern - Regex pattern for validation (default: alphanumeric + basic punctuation)
 * @param options.pattern_message - Custom message for pattern validation
 * @param options.sanitize - Whether to sanitize the string by trimming (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalStringValidation({ field_name: 'Description' })
 *   description?: string;
 *
 *   @OptionalStringValidation({
 *     field_name: 'Notes',
 *     max_length: 1000,
 *     pattern: /^[a-zA-Z0-9\s\-_&.,()!?]+$/,
 *     pattern_message: 'Notes can only contain letters, numbers, spaces, and basic punctuation'
 *   })
 *   notes?: string;
 * }
 * ```
 */
export function OptionalStringValidation(
  options: Omit<RequiredStringValidationOptions, 'allow_empty'> = {},
) {
  const {
    field_name = 'Field',
    min_length = 1,
    max_length = 255,
    pattern = /^[a-zA-Z0-9\s\-_&.,()]+$/,
    pattern_message = `${field_name} can only contain letters, numbers, spaces, and basic punctuation`,
    sanitize = true,
  } = options;

  // Validate input parameters
  if (min_length < 0) {
    throw new DecoratorValidationException(
      'min_length must be a non-negative number',
      'OptionalStringValidation',
    );
  }
  if (max_length < min_length) {
    throw new DecoratorValidationException(
      'max_length must be greater than or equal to min_length',
      'OptionalStringValidation',
    );
  }
  if (!(pattern instanceof RegExp)) {
    throw new DecoratorValidationException(
      'pattern must be a RegExp',
      'OptionalStringValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add sanitization transformation if enabled
  if (sanitize) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Trim, convert to lowercase, and return
        const trimmed = String(value).trim();
        const lowercased = trimmed.toLowerCase();
        return lowercased === '' ? null : lowercased;
      }),
    );
  }

  // Add optional validation - must be first
  decorators.push(IsOptional());

  // Add string validation (only validate if value is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    IsString({ message: `${field_name} must be a string` }),
  );

  // Add length validation (only if string is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    Length(min_length, max_length, {
      message: `${field_name} must be between ${min_length} and ${max_length} characters`,
    }),
  );

  // Add pattern validation (only if string is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    Matches(pattern, { message: pattern_message }),
  );

  return applyDecorators(...decorators);
}
