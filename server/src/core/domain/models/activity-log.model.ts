import { getPHDateTime, RequestInfo } from '../../utils';
import { HTTP_STATUS } from '../constants';
import { ActivityLogBusinessException } from '../exceptions/activitylog';

/**
 * ActivityLog Domain Model
 *
 * Represents an audit log entry for tracking system activities.
 * This is a rich domain model that encapsulates business logic and behavior.
 * Activity logs are immutable once created - they serve as an audit trail.
 */
export class ActivityLog {
  id?: number;
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT'
  entity: string; // e.g., 'Client'
  details: string; // JSON string containing the details of the activity
  employee_id?: number; // foreign key to employees table (optional: only populated when activity is related to an employee)
  request_info: string;
  occurred_at: Date; // Date and time when the activity occurred

  constructor(params: {
    id?: number;
    action: string;
    entity: string;
    details: string;
    employee_id?: number;
    request_info: string;
    occurred_at: Date;
  }) {
    this.id = params.id;
    this.action = params.action;
    this.entity = params.entity;
    this.details = params.details;
    this.employee_id = params.employee_id;
    this.request_info = params.request_info;
    this.occurred_at = params.occurred_at;
  }

  /**
   * Creates a new activity log entry
   *
   * This static factory method creates a new activity log entry with proper
   * initialization. Activity logs are immutable audit records that track
   * system activities.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: ActivityLog.create({...})
   *
   * @param params - Activity log creation parameters
   * @returns A new ActivityLog instance
   */
  static create(params: {
    action: string;
    entity: string;
    details: string;
    employee_id?: number;
    request_info: RequestInfo;
  }): ActivityLog {
    // Convert request_info object to JSON string
    const requestInfoJson = JSON.stringify(params.request_info);

    const activityLog = new ActivityLog({
      action: params.action,
      entity: params.entity,
      details: params.details,
      employee_id: params.employee_id,
      occurred_at: getPHDateTime(),
      request_info: requestInfoJson,
    });
    // Validate the activity log before returning
    activityLog.validate();
    return activityLog;
  }

  /**
   * Validates the activity log against business rules
   *
   * This method enforces basic validation rules such as:
   * - Action must be provided and within length limits
   * - Entity must be provided and within length limits
   * - Timestamp must be a valid date
   * - Request info must be provided
   * - User name must be provided and within length limits
   * - Optional fields (IP address, user agent, session ID) must be within length limits if provided
   *
   * @throws ActivityLogBusinessException - If validation fails
   */
  validate(): void {
    // Validate if action is provided
    if (!this.action || this.action.trim().length === 0) {
      throw new ActivityLogBusinessException(
        'Action is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if action length is within limits (100 characters max based on entity)
    if (this.action.length > 100) {
      throw new ActivityLogBusinessException(
        'Action must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if entity is provided
    if (!this.entity || this.entity.trim().length === 0) {
      throw new ActivityLogBusinessException(
        'Entity is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if entity length is within limits (100 characters max based on entity)
    if (this.entity.length > 100) {
      throw new ActivityLogBusinessException(
        'Entity must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if timestamp is a valid date
    if (
      !this.occurred_at ||
      !(this.occurred_at instanceof Date) ||
      isNaN(this.occurred_at.getTime())
    ) {
      throw new ActivityLogBusinessException(
        'Occurred at must be a valid date.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if request_info is provided
    if (!this.request_info || this.request_info.trim().length === 0) {
      throw new ActivityLogBusinessException(
        'Request info is required and cannot be null, undefined, or empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Parse and validate request_info JSON
    let parsedRequestInfo: RequestInfo;
    try {
      parsedRequestInfo = JSON.parse(this.request_info);
    } catch (error: any) {
      throw new ActivityLogBusinessException(
        `Request info must be valid JSON: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if user_name is provided (required field)
    if (
      !parsedRequestInfo.user_name ||
      parsedRequestInfo.user_name.trim().length === 0
    ) {
      throw new ActivityLogBusinessException(
        'User name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if user_name length is within limits (100 characters max)
    if (parsedRequestInfo.user_name.length > 100) {
      throw new ActivityLogBusinessException(
        'User name must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate optional fields if provided
    if (
      parsedRequestInfo.ip_address &&
      parsedRequestInfo.ip_address.length > 45
    ) {
      throw new ActivityLogBusinessException(
        'IP address must not exceed 45 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      parsedRequestInfo.user_agent &&
      parsedRequestInfo.user_agent.length > 500
    ) {
      throw new ActivityLogBusinessException(
        'User agent must not exceed 500 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      parsedRequestInfo.session_id &&
      parsedRequestInfo.session_id.length > 255
    ) {
      throw new ActivityLogBusinessException(
        'Session ID must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
