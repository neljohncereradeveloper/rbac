import { HTTP_STATUS } from '@/core/domain/constants';
import { DomainException } from '@/core/domain/exceptions/domain.exception';

/**
 * Thrown when user data violates domain invariants or business rules
 */
export class UserBusinessException extends DomainException {
  constructor(message: string, status_code: number = HTTP_STATUS.BAD_REQUEST) {
    super(message, 'USER_BUSINESS_EXCEPTION', status_code);
    this.name = 'UserBusinessException';
  }
}
