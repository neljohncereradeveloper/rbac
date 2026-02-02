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
import { IsDecimalPlaces } from './decimal-places-validator.decorator';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator';

export interface RequiredDecimalValidationOptions {
  field_name?: string;
  min?: number;
  max?: number;
  allow_zero?: boolean;
  allow_negative?: boolean;
  transform?: boolean;
  decimal_places?: number;
}

/**
 * Reusable validation decorator for required decimal numbers with range validation
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allow_zero - Whether to allow zero values (default: true)
 * @param options.allow_negative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 * @param options.decimal_places - Number of decimal places allowed (default: 2)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredDecimalValidation({ field_name: 'Price' })
 *   price: number;
 *
 *   @RequiredDecimalValidation({
 *     field_name: 'Salary',
 *     min: 0,
 *     max: 1000000,
 *     allowZero: false,
 *     allowNegative: false,
 *     decimal_places: 2
 *   })
 *   salary: number;
 * }
 * ```
 */
export function RequiredDecimalValidation(
  options: RequiredDecimalValidationOptions = {},
) {
  const {
    field_name = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allow_zero = true,
    allow_negative = false,
    transform = true,
    decimal_places = 2,
  } = options;

  // Validate input parameters
  if (typeof min !== 'number' || !isFinite(min)) {
    throw new DecoratorValidationException(
      'min must be a finite number',
      'RequiredDecimalValidation',
    );
  }
  if (typeof max !== 'number' || !isFinite(max)) {
    throw new DecoratorValidationException(
      'max must be a finite number',
      'RequiredDecimalValidation',
    );
  }
  if (max < min) {
    throw new DecoratorValidationException(
      'max must be greater than or equal to min',
      'RequiredDecimalValidation',
    );
  }
  if (typeof decimal_places !== 'number' || decimal_places < 0) {
    throw new DecoratorValidationException(
      'decimal_places must be a non-negative number',
      'RequiredDecimalValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled (must be before decimal places validation)
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
          const parsed = parseFloat(trimmed);
          return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' && isFinite(value) ? value : null;
      }),
    );
  }

  // Add decimal places validation using custom validator (after transformation)
  decorators.push(
    IsDecimalPlaces(decimal_places, {
      message: `${field_name} must be a whole number or have at most ${decimal_places} decimal places`,
    }),
  );

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
      Min(0.01, { message: `${field_name} must be greater than 0` }),
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
 * Reusable validation decorator for optional decimal numbers with range validation
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min - Minimum value (default: 0)
 * @param options.max - Maximum value (default: Number.MAX_SAFE_INTEGER)
 * @param options.allow_zero - Whether to allow zero values (default: true)
 * @param options.allow_negative - Whether to allow negative values (default: false)
 * @param options.transform - Whether to transform string values to numbers (default: true)
 * @param options.decimal_places - Number of decimal places allowed (default: 2)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalDecimalValidation({ field_name: 'Discount' })
 *   discount?: number;
 *
 *   @OptionalDecimalValidation({
 *     field_name: 'Commission',
 *     min: 0,
 *     max: 100,
 *     allow_zero: true,
 *     allow_negative: false,
 *     decimal_places: 2
 *   })
 *   commission?: number;
 * }
 * ```
 */
export function OptionalDecimalValidation(
  options: RequiredDecimalValidationOptions = {},
) {
  const {
    field_name = 'Field',
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    allow_zero = true,
    allow_negative = false,
    transform = true,
    decimal_places = 2,
  } = options;

  // Validate input parameters
  if (typeof min !== 'number' || !isFinite(min)) {
    throw new DecoratorValidationException(
      'min must be a finite number',
      'OptionalDecimalValidation',
    );
  }
  if (typeof max !== 'number' || !isFinite(max)) {
    throw new DecoratorValidationException(
      'max must be a finite number',
      'OptionalDecimalValidation',
    );
  }
  if (max < min) {
    throw new DecoratorValidationException(
      'max must be greater than or equal to min',
      'OptionalDecimalValidation',
    );
  }
  if (typeof decimal_places !== 'number' || decimal_places < 0) {
    throw new DecoratorValidationException(
      'decimal_places must be a non-negative number',
      'OptionalDecimalValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled (must be before decimal places validation)
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
          const parsed = parseFloat(trimmed);
          return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
        }

        // Return as-is if already a number
        return typeof value === 'number' && isFinite(value) ? value : null;
      }),
    );
  }

  // Add optional validation - must be first
  decorators.push(IsOptional());

  // Add decimal places validation using custom validator (only if value is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    IsDecimalPlaces(decimal_places, {
      message: `${field_name} must be a whole number or have at most ${decimal_places} decimal places`,
    }),
  );

  // Add number validation (only if value is provided)
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
      Min(0.01, { message: `${field_name} must be greater than 0` }),
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
