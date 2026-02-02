import { DomainException } from '../domain.exception';

/**
 * Thrown when a check constraint is violated
 * PostgreSQL error code: 23514
 */
export class CheckConstraintViolationException extends DomainException {
  constructor(
    message: string = 'Data validation failed',
    constraint_name?: string,
  ) {
    const error_message = constraint_name
      ? `Data validation failed for constraint '${constraint_name}'`
      : message;

    super(error_message, 'CHECK_CONSTRAINT_VIOLATION', 400);
  }
}
