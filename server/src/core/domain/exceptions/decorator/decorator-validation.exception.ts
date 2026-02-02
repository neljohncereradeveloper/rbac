import { HTTP_STATUS } from '../../constants';
import { DomainException } from '../domain.exception';

/**
 * Exception thrown when a decorator is configured with invalid parameters
 * This is thrown during decorator setup when validation decorators are misconfigured
 */
export class DecoratorValidationException extends DomainException {
  constructor(message: string, decoratorName?: string) {
    const error_message = decoratorName
      ? `${decoratorName}: ${message}`
      : message;

    super(error_message, 'DECORATOR_VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST);
  }
}
