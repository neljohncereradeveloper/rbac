import { applyDecorators } from '@nestjs/common';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator';

export interface RequiredArrayValidationOptions {
  field_name?: string;
  min_items?: number;
  max_items?: number;
  allow_empty?: boolean;
  transform?: boolean;
}

/**
 * Reusable validation decorator for required arrays
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min_items - Minimum number of items (default: 1)
 * @param options.max_items - Maximum number of items (default: no limit)
 * @param options.allow_empty - Whether to allow empty arrays (default: false)
 * @param options.transform - Whether to transform string values to arrays (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredArrayValidation({ field_name: 'Tags' })
 *   tags: string[];
 *
 *   @RequiredArrayValidation({
 *     field_name: 'Items',
 *     min_items: 1,
 *     max_items: 10,
 *     allow_empty: false
 *   })
 *   items: number[];
 * }
 * ```
 */
export function RequiredArrayValidation(
  options: RequiredArrayValidationOptions = {},
) {
  const {
    field_name = 'Field',
    min_items = 1,
    max_items,
    allow_empty = false,
    transform = true,
  } = options;

  // Validate input parameters
  if (typeof min_items !== 'number' || min_items < 0) {
    throw new DecoratorValidationException(
      'min_items must be a non-negative number',
      'RequiredArrayValidation',
    );
  }
  if (max_items !== undefined) {
    if (typeof max_items !== 'number' || max_items < 0) {
      throw new DecoratorValidationException(
        'max_items must be a non-negative number',
        'RequiredArrayValidation',
      );
    }
    if (max_items < min_items) {
      throw new DecoratorValidationException(
        'max_items must be greater than or equal to min_items',
        'RequiredArrayValidation',
      );
    }
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        // Handle empty values
        if (value === '' || value === null || value === undefined) {
          return allow_empty ? [] : null;
        }

        // Return as-is if already an array
        if (Array.isArray(value)) {
          return value;
        }

        // Try to parse as JSON array
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If not valid JSON, treat as single-item array
            return [value];
          }
        }

        // Convert single value to array
        return [value];
      }),
    );
  }

  // Add IsNotEmpty only if empty arrays are not allowed
  if (!allow_empty) {
    decorators.push(IsNotEmpty({ message: `${field_name} is required` }));
  }

  // Add array validation
  decorators.push(IsArray({ message: `${field_name} must be an array` }));

  // Add minimum items validation
  if (min_items > 0) {
    decorators.push(
      ArrayMinSize(min_items, {
        message: `${field_name} must contain at least ${min_items} item${min_items === 1 ? '' : 's'}`,
      }),
    );
  }

  // Add maximum items validation
  if (max_items !== undefined && max_items >= 0) {
    decorators.push(
      ArrayMaxSize(max_items, {
        message: `${field_name} must contain at most ${max_items} item${max_items === 1 ? '' : 's'}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional arrays
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Field')
 * @param options.min_items - Minimum number of items (default: 1)
 * @param options.max_items - Maximum number of items (default: no limit)
 * @param options.transform - Whether to transform string values to arrays (default: true)
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalArrayValidation({ field_name: 'Tags' })
 *   tags?: string[];
 *
 *   @OptionalArrayValidation({
 *     field_name: 'Items',
 *     min_items: 1,
 *     max_items: 10
 *   })
 *   items?: number[];
 * }
 * ```
 */
export function OptionalArrayValidation(
  options: Omit<RequiredArrayValidationOptions, 'allow_empty'> = {},
) {
  const {
    field_name = 'Field',
    min_items = 1,
    max_items,
    transform = true,
  } = options;

  // Validate input parameters
  if (typeof min_items !== 'number' || min_items < 0) {
    throw new DecoratorValidationException(
      'min_items must be a non-negative number',
      'OptionalArrayValidation',
    );
  }
  if (max_items !== undefined) {
    if (typeof max_items !== 'number' || max_items < 0) {
      throw new DecoratorValidationException(
        'max_items must be a non-negative number',
        'OptionalArrayValidation',
      );
    }
    if (max_items < min_items) {
      throw new DecoratorValidationException(
        'max_items must be greater than or equal to min_items',
        'OptionalArrayValidation',
      );
    }
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

        // Return as-is if already an array
        if (Array.isArray(value)) {
          return value;
        }

        // Try to parse as JSON array
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If not valid JSON, treat as single-item array
            return [value];
          }
        }

        // Convert single value to array
        return [value];
      }),
    );
  }

  // Add optional validation - must be first
  decorators.push(IsOptional());

  // Add array validation (only validate if value is provided)
  decorators.push(
    ValidateIf((o, v) => v !== null && v !== undefined),
    IsArray({ message: `${field_name} must be an array` }),
  );

  // Add minimum items validation (only if value is provided)
  if (min_items > 0) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined),
      ArrayMinSize(min_items, {
        message: `${field_name} must contain at least ${min_items} item${min_items === 1 ? '' : 's'}`,
      }),
    );
  }

  // Add maximum items validation (only if value is provided)
  if (max_items !== undefined && max_items >= 0) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined),
      ArrayMaxSize(max_items, {
        message: `${field_name} must contain at most ${max_items} item${max_items === 1 ? '' : 's'}`,
      }),
    );
  }

  return applyDecorators(...decorators);
}
