import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator';

export interface RequiredNumberValidationOptions {
  field_name?: string;
  min?: number;
  max?: number;
  allow_zero?: boolean;
  allow_negative?: boolean;
  transform?: boolean;
}

/**
 * Reusable validation decorator for required numbers with range validation
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allow_zero - Whether to allow zero values (default: true)
 * @param options.allow_negative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredNumberValidation({ field_name: 'Age' })
 *   age: number;
 *
 *   @RequiredNumberValidation({
 *     field_name: 'Salary',
 *     min: 1000,
 *     max: 1000000,
 *     allow_zero: false,
 *     allow_negative: false
 *   })
 *   salary: number;
 * }
 * ```
 */
export function RequiredNumberValidation(
  options: RequiredNumberValidationOptions = {},
) {
  const {
    field_name = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allow_zero = true,
    allow_negative = false,
    transform = true,
  } = options;

  // Validate input parameters
  if (typeof min !== 'number' || !isFinite(min)) {
    throw new DecoratorValidationException(
      'min must be a finite number',
      'RequiredNumberValidation',
    );
  }
  if (typeof max !== 'number' || !isFinite(max)) {
    throw new DecoratorValidationException(
      'max must be a finite number',
      'RequiredNumberValidation',
    );
  }
  if (max < min) {
    throw new DecoratorValidationException(
      'max must be greater than or equal to min',
      'RequiredNumberValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Convert string to number
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '') {
            return null;
          }

          // Validate string format: must contain only digits (and optionally minus sign for negative numbers)
          const number_pattern = allow_negative ? /^-?\d+$/ : /^\d+$/;
          if (!number_pattern.test(trimmed)) {
            return NaN; // Return NaN to trigger IsNumber validation error
          }

          const parsed = parseInt(trimmed, 10);
          return isNaN(parsed) ? NaN : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' && isFinite(value) ? value : null;
      }),
    );
  }

  // Add IsNotEmpty validation
  decorators.push(IsNotEmpty({ message: `${field_name} is required` }));

  // Add number validation
  decorators.push(
    IsNumber(
      { allowNaN: false, allowInfinity: false },
      { message: `${field_name} must be a valid number` },
    ),
  );

  // Add minimum value validation
  if (!allow_zero && !allow_negative) {
    decorators.push(
      Min(1, { message: `${field_name} must be greater than 0` }),
    );
  } else if (allow_zero && !allow_negative) {
    decorators.push(
      Min(0, { message: `${field_name} must be greater than or equal to 0` }),
    );
  } else if (allow_negative) {
    decorators.push(
      Min(min, {
        message: `${field_name} must be greater than or equal to ${min}`,
      }),
    );
  }

  // Add maximum value validation
  if (max !== Number.MAX_SAFE_INTEGER && isFinite(max)) {
    decorators.push(
      Max(max, {
        message: `${field_name} must be less than or equal to ${max}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional numbers with range validation
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allow_zero - Whether to allow zero values (default: true)
 * @param options.allow_negative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalNumberValidation({ field_name: 'Bonus' })
 *   bonus?: number;
 *
 *   @OptionalNumberValidation({
 *     field_name: 'Commission',
 *     min: 0,
 *     max: 100,
 *     allow_zero: true,
 *     allow_negative: false
 *   })
 *   commission?: number;
 * }
 * ```
 */
export function OptionalNumberValidation(
  options: RequiredNumberValidationOptions = {},
) {
  const {
    field_name = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allow_zero = true,
    allow_negative = false,
    transform = true,
  } = options;

  // Validate input parameters
  if (typeof min !== 'number' || !isFinite(min)) {
    throw new DecoratorValidationException(
      'min must be a finite number',
      'OptionalNumberValidation',
    );
  }
  if (typeof max !== 'number' || !isFinite(max)) {
    throw new DecoratorValidationException(
      'max must be a finite number',
      'OptionalNumberValidation',
    );
  }
  if (max < min) {
    throw new DecoratorValidationException(
      'max must be greater than or equal to min',
      'OptionalNumberValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return null;
        }

        // Convert string to number
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '') {
            return null;
          }

          // Validate string format: must contain only digits (and optionally minus sign for negative numbers)
          const number_pattern = allow_negative ? /^-?\d+$/ : /^\d+$/;
          if (!number_pattern.test(trimmed)) {
            return NaN; // Return NaN to trigger IsNumber validation error
          }

          const parsed = parseInt(trimmed, 10);
          return isNaN(parsed) ? NaN : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' && isFinite(value) ? value : null;
      }),
    );
  }

  // Add optional validation - must be first
  decorators.push(IsOptional());

  // Add number validation (only validate if value is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    IsNumber(
      { allowNaN: false, allowInfinity: false },
      { message: `${field_name} must be a valid number` },
    ),
  );

  // Add minimum value validation (only if value is provided)
  if (!allow_zero && !allow_negative) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined),
      Min(1, { message: `${field_name} must be greater than 0` }),
    );
  } else if (allow_zero && !allow_negative) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined),
      Min(0, { message: `${field_name} must be greater than or equal to 0` }),
    );
  } else if (allow_negative) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined),
      Min(min, {
        message: `${field_name} must be greater than or equal to ${min}`,
      }),
    );
  }

  // Add maximum value validation (only if value is provided)
  if (max !== Number.MAX_SAFE_INTEGER && isFinite(max)) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined),
      Max(max, {
        message: `${field_name} must be less than or equal to ${max}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}
