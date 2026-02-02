import { applyDecorators } from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DecoratorValidationException } from '@/core/domain/exceptions/decorator';
import { IsDateStringCustom, transformDateString } from '../../utils/date.util';

export interface RequiredDateValidationOptions {
  field_name?: string;
  transform?: boolean;
  min_date?: Date;
  max_date?: Date;
}

export interface OptionalDateValidationOptions {
  field_name?: string;
  transform?: boolean;
  min_date?: Date;
  max_date?: Date;
}

/**
 * Custom validator for minimum date
 */
function IsMinDate(min_date: Date, field_name: string): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    registerDecorator({
      name: 'isMinDate',
      target: target.constructor,
      propertyName: propertyKey as string,
      constraints: [min_date],
      options: {
        message: `${field_name} must be on or after ${min_date.toISOString().split('T')[0]}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Let other validators handle empty values
          const dateValue = value instanceof Date ? value : new Date(value);
          if (isNaN(dateValue.getTime())) return true; // Let IsDateStringCustom handle invalid dates
          const minDate = args.constraints[0] as Date;
          // Compare dates without time (set to midnight)
          const valueDate = new Date(
            dateValue.getFullYear(),
            dateValue.getMonth(),
            dateValue.getDate(),
          );
          const minDateOnly = new Date(
            minDate.getFullYear(),
            minDate.getMonth(),
            minDate.getDate(),
          );
          return valueDate >= minDateOnly;
        },
      },
    });
  };
}

/**
 * Custom validator for maximum date
 */
function IsMaxDate(max_date: Date, field_name: string): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    registerDecorator({
      name: 'isMaxDate',
      target: target.constructor,
      propertyName: propertyKey as string,
      constraints: [max_date],
      options: {
        message: `${field_name} must be on or before ${max_date.toISOString().split('T')[0]}`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Let other validators handle empty values
          const dateValue = value instanceof Date ? value : new Date(value);
          if (isNaN(dateValue.getTime())) return true; // Let IsDateStringCustom handle invalid dates
          const maxDate = args.constraints[0] as Date;
          // Compare dates without time (set to midnight)
          const valueDate = new Date(
            dateValue.getFullYear(),
            dateValue.getMonth(),
            dateValue.getDate(),
          );
          const maxDateOnly = new Date(
            maxDate.getFullYear(),
            maxDate.getMonth(),
            maxDate.getDate(),
          );
          return valueDate <= maxDateOnly;
        },
      },
    });
  };
}

/**
 * Reusable validation decorator for required dates
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Date')
 * @param options.transform - Whether to transform string dates to Date objects (default: true)
 * @param options.min_date - Minimum allowed date
 * @param options.max_date - Maximum allowed date
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @RequiredDateValidation({ field_name: 'Holiday date' })
 *   date: Date;
 *
 *   @RequiredDateValidation({
 *     field_name: 'Start date',
 *     min_date: new Date('2024-01-01'),
 *     max_date: new Date('2024-12-31')
 *   })
 *   startDate: Date;
 * }
 * ```
 */
export function RequiredDateValidation(
  options: RequiredDateValidationOptions = {},
) {
  const { field_name = 'Date', transform = true, min_date, max_date } = options;

  // Validate input parameters
  if (min_date && max_date && min_date > max_date) {
    throw new DecoratorValidationException(
      'min_date must be less than or equal to max_date',
      'RequiredDateValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        if (value === null || value === undefined || value === '') {
          return null;
        }
        return transformDateString(value);
      }),
    );
  }

  // Add required validation
  decorators.push(IsNotEmpty({ message: `${field_name} is required` }));

  // Add date validation
  decorators.push(
    IsDateStringCustom({
      message: `${field_name} must be a valid date string (YYYY-MM-DD)`,
    }) as PropertyDecorator,
  );

  // Add min date validation if provided
  if (min_date) {
    decorators.push(IsMinDate(min_date, field_name));
  }

  // Add max date validation if provided
  if (max_date) {
    decorators.push(IsMaxDate(max_date, field_name));
  }

  return applyDecorators(...decorators);
}

/**
 * Reusable validation decorator for optional dates
 *
 * @param options - Validation options
 * @param options.field_name - Name of the field for error messages (default: 'Date')
 * @param options.transform - Whether to transform string dates to Date objects (default: true)
 * @param options.min_date - Minimum allowed date
 * @param options.max_date - Maximum allowed date
 *
 * @example
 * ```typescript
 * export class MyDto {
 *   @OptionalDateValidation({ field_name: 'End date' })
 *   endDate?: Date;
 *
 *   @OptionalDateValidation({
 *     field_name: 'Expiry date',
 *     min_date: new Date('2024-01-01')
 *   })
 *   expiryDate?: Date;
 * }
 * ```
 */
export function OptionalDateValidation(
  options: OptionalDateValidationOptions = {},
) {
  const { field_name = 'Date', transform = true, min_date, max_date } = options;

  // Validate input parameters
  if (min_date && max_date && min_date > max_date) {
    throw new DecoratorValidationException(
      'min_date must be less than or equal to max_date',
      'OptionalDateValidation',
    );
  }

  const decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[] =
    [];

  // Add transformation if enabled
  if (transform) {
    decorators.push(
      Transform(({ value }) => {
        if (value === null || value === undefined || value === '') {
          return null;
        }
        return transformDateString(value);
      }),
    );
  }

  // Add optional validation - must be first
  decorators.push(IsOptional());

  // Add date validation (only validate if value is provided)
  decorators.push(
    applyDecorators(
      ValidateIf((o, v) => v !== null && v !== undefined && v !== ''),
      IsDateStringCustom({
        message: `${field_name} must be a valid date string (YYYY-MM-DD)`,
      }) as PropertyDecorator,
    ),
  );

  // Add min date validation if provided (only if value is provided)
  if (min_date) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined && v !== ''),
      IsMinDate(min_date, field_name),
    );
  }

  // Add max date validation if provided (only if value is provided)
  if (max_date) {
    decorators.push(
      ValidateIf((o, v) => v !== null && v !== undefined && v !== ''),
      IsMaxDate(max_date, field_name),
    );
  }

  return applyDecorators(...decorators);
}
