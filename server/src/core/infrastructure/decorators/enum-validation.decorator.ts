import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator';

export interface EnumValidationOptions {
  field_name?: string;
  enum_object: object;
  transform?: boolean;
}

/**
 * Reusable validation decorator for required enum values
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.enum_object - The enum object to validate against
 * @param options.transform - Whether to transform string values (default: true)
 *
 * @example
 * ```typescript
 * enum StatusEnum {
 *   ACTIVE = 'active',
 *   INACTIVE = 'inactive',
 * }
 *
 * export class MyDto {
 *   @RequiredEnumValidation({
 *     field_name: 'Status',
 *     enum_object: StatusEnum
 *   })
 *   status: StatusEnum;
 * }
 * ```
 */
export function RequiredEnumValidation(options: EnumValidationOptions) {
  const { field_name = 'Field', enum_object, transform = true } = options;

  // Validate input parameters
  if (!enum_object || typeof enum_object !== 'object') {
    throw new DecoratorValidationException(
      'enum_object must be a valid enum object',
      'RequiredEnumValidation',
    );
  }

  // Get enum values for error message
  const enum_values = Object.values(enum_object);
  const enum_values_string = enum_values.join(', ');

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

        // Convert to string and trim
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed === '' ? null : trimmed;
        }

        // Return as-is for other types
        return value;
      }),
    );
  }

  // Add IsNotEmpty validation
  decorators.push(IsNotEmpty({ message: `${field_name} is required` }));

  // Add enum validation
  decorators.push(
    IsEnum(enum_object, {
      message: `${field_name} must be one of: ${enum_values_string}`,
    }),
  );

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional enum values
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.enum_object - The enum object to validate against
 * @param options.transform - Whether to transform string values (default: true)
 *
 * @example
 * ```typescript
 * enum StatusEnum {
 *   ACTIVE = 'active',
 *   INACTIVE = 'inactive',
 * }
 *
 * export class MyDto {
 *   @OptionalEnumValidation({
 *     field_name: 'Status',
 *     enum_object: StatusEnum
 *   })
 *   status?: StatusEnum;
 * }
 * ```
 */
export function OptionalEnumValidation(options: EnumValidationOptions) {
  const { field_name = 'Field', enum_object, transform = true } = options;

  // Validate input parameters
  if (!enum_object || typeof enum_object !== 'object') {
    throw new DecoratorValidationException(
      'enum_object must be a valid enum object',
      'OptionalEnumValidation',
    );
  }

  // Get enum values for error message
  const enum_values = Object.values(enum_object);
  const enum_values_string = enum_values.join(', ');

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

        // Convert to string and trim
        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed === '' ? null : trimmed;
        }

        // Return as-is for other types
        return value;
      }),
    );
  }

  // Add optional validation - must be first
  decorators.push(IsOptional());

  // Add enum validation (only validate if value is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    IsEnum(enum_object, {
      message: `${field_name} must be one of: ${enum_values_string}`,
    }),
  );

  return applyDecorators(...decorators);
}
