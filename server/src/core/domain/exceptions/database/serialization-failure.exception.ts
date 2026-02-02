import { DomainException } from '../domain.exception';

/**
 * Thrown when a serialization failure occurs (deadlock or transaction conflict)
 * PostgreSQL error code: 40001
 */
export class SerializationFailureException extends DomainException {
  constructor(message: string = 'Transaction conflict. Please retry') {
    super(message, 'SERIALIZATION_FAILURE', 409);
  }
}
