import { HTTP_STATUS } from '@/core/domain/constants';
import { DomainException } from '@/core/domain/exceptions/domain.exception';

/**
 * Thrown when holiday data violates domain invariants or business rules
 */
export class HolidayBusinessException extends DomainException {
  constructor(message: string, status_code: number = HTTP_STATUS.BAD_REQUEST) {
    super(message, 'HOLIDAY_BUSINESS_EXCEPTION', status_code);
    this.name = 'HolidayBusinessException';
  }
}
