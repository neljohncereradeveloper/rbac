import { DomainException } from '../domain.exception';

/**
 * Thrown when a foreign key constraint is violated
 * PostgreSQL error code: 23503
 */
export class ForeignKeyViolationException extends DomainException {
  constructor(
    message: string = 'Referenced record does not exist',
    referenced_table?: string,
    referenced_field?: string,
  ) {
    const error_message =
      referenced_table && referenced_field
        ? `Referenced record in ${referenced_table}.${referenced_field} does not exist`
        : message;

    super(error_message, 'FOREIGN_KEY_VIOLATION', 404);
  }
}
