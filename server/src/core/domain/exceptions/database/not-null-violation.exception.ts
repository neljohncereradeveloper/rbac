import { DomainException } from '../domain.exception';

/**
 * Thrown when a NOT NULL constraint is violated
 * PostgreSQL error code: 23502
 */
export class NotNullViolationException extends DomainException {
  constructor(message: string = 'Required field is missing', field?: string) {
    const error_message = field
      ? `Required field '${field}' is missing`
      : message;

    super(error_message, 'NOT_NULL_VIOLATION', 400);
  }
}
