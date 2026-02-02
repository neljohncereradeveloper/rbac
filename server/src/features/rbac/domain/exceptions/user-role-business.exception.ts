import { HTTP_STATUS } from '@/core/domain/constants';
import { DomainException } from '@/core/domain/exceptions/domain.exception';

/**
 * Thrown when user-role data violates domain invariants or business rules
 */
export class UserRoleBusinessException extends DomainException {
  constructor(message: string, status_code: number = HTTP_STATUS.BAD_REQUEST) {
    super(message, 'USER_ROLE_BUSINESS_EXCEPTION', status_code);
    this.name = 'UserRoleBusinessException';
  }
}
