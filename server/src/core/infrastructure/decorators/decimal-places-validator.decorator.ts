import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator/decorator-validation.exception';

/**
 * Custom validator for decimal places
 * Validates that a number has at most the specified number of decimal places
 *
 * @param decimal_places - Maximum number of decimal places allowed
 * @param validation_options - Optional validation options
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @IsDecimalPlaces(2)
 *   price: number; // Allows: 10, 10.5, 10.50, but not 10.555
 * }
 * ```
 */
export function IsDecimalPlaces(
  decimal_places: number,
  validation_options?: ValidationOptions,
) {
  // Validate input parameter
  if (typeof decimal_places !== 'number' || decimal_places < 0) {
    throw new DecoratorValidationException(
      'decimal_places must be a non-negative number',
      'IsDecimalPlaces',
    );
  }

  return function (object: object, propertyName: string | symbol) {
    registerDecorator({
      name: 'isDecimalPlaces',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [decimal_places],
      options: validation_options,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const max_decimal_places = args.constraints[0];

          // Let other validators handle null/undefined
          if (value === null || value === undefined) {
            return true;
          }

          // Convert to number if string
          const num_value =
            typeof value === 'number' ? value : parseFloat(String(value));

          // If not a valid number, let IsNumber validator handle it
          if (isNaN(num_value) || !isFinite(num_value)) {
            return true; // Let IsNumber validator handle invalid numbers
          }

          // Handle scientific notation (e.g., 1e-5)
          const str = num_value.toString();

          // Check if it's in scientific notation
          if (str.includes('e') || str.includes('E')) {
            // Convert from scientific notation to regular decimal
            const regular_str = num_value.toFixed(max_decimal_places);
            const regular_num = parseFloat(regular_str);
            return Math.abs(regular_num - num_value) < Number.EPSILON;
          }

          // Split by decimal point
          const parts = str.split('.');

          if (parts.length === 1) {
            // No decimal places, whole number - always valid
            return true;
          }

          // Check decimal places (remove trailing zeros for accurate count)
          const decimal_part = parts[1].replace(/0+$/, '');
          return decimal_part.length <= max_decimal_places;
        },
        defaultMessage(args: ValidationArguments) {
          const max_decimal_places = args.constraints[0];
          if (max_decimal_places === 0) {
            return `${args.property} must be a whole number`;
          }
          return `${args.property} must be a whole number or have at most ${max_decimal_places} decimal places`;
        },
      },
    });
  };
}
