import { HTTP_STATUS } from '../../constants';
import { DomainException } from '../domain.exception';

/**
 * Thrown when activity log data violates domain invariants or business rules
 */
export class ActivityLogBusinessException extends DomainException {
  constructor(message: string, status_code: number = HTTP_STATUS.BAD_REQUEST) {
    super(message, 'ACTIVITY_LOG_BUSINESS_EXCEPTION', status_code);
    this.name = 'ActivityLogBusinessException';
  }
}
