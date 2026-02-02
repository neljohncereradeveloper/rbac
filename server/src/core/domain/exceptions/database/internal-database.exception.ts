import { DomainException } from '../domain.exception';

/**
 * Thrown when an internal database error occurs
 */
export class InternalDatabaseErrorException extends DomainException {
  constructor(message: string = 'An internal database error occurred') {
    super(message, 'INTERNAL_DATABASE_ERROR', 500);
  }
}
