import { DATABASE_CORE_MODELS } from '@/core/domain/constants';
import { ActivityLog } from '@/core/domain/models/activity-log.model';
import { ActivityLogRepository } from '@/core/domain/repositories/activity-log.repository';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ActivityLogRepositoryImpl implements ActivityLogRepository<EntityManager> {
  private readonly logger = new Logger(ActivityLogRepositoryImpl.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(log: ActivityLog, manager: EntityManager): Promise<ActivityLog> {
    // Validate that details is valid JSON before storing
    let detailsJson: string | null = null;
    if (log.details) {
      try {
        // Parse to validate JSON, then use original string for storage
        // This ensures we're storing valid JSON while preserving the exact format
        JSON.parse(log.details);
        detailsJson = log.details;
      } catch (error: any) {
        this.logger.warn(
          `Invalid JSON in activity log details, storing as escaped string: ${error.message}`,
        );
        // If invalid JSON, wrap it in an object to preserve the data
        detailsJson = JSON.stringify({ raw: log.details });
      }
    }

    // Validate that details is valid JSON before storing
    let requestInfoJson: string | null = null;
    if (log.request_info) {
      try {
        // Parse to validate JSON, then use original string for storage
        // This ensures we're storing valid JSON while preserving the exact format
        JSON.parse(log.request_info);
        requestInfoJson = log.request_info;
      } catch (error: any) {
        this.logger.warn(
          `Invalid JSON in activity log request_info, storing as escaped string: ${error.message}`,
        );
        // If invalid JSON, wrap it in an object to preserve the data
        requestInfoJson = JSON.stringify({ raw: log.request_info });
      }
    }

    // Use raw SQL query for insert
    const query = `
      INSERT INTO ${DATABASE_CORE_MODELS.ACTIVITYLOGS} (action, entity, details, employee_id, occurred_at, request_info)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await manager.query(query, [
      log.action,
      log.entity,
      detailsJson,
      log.employee_id || null,
      log.occurred_at || new Date(),
      requestInfoJson,
    ]);

    const savedEntity = result[0];
    return this.rowToModel(savedEntity);
  }

  async findAll(): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        employee_id,
        occurred_at,
        request_info
      FROM ${DATABASE_CORE_MODELS.ACTIVITYLOGS}
      ORDER BY occurred_at DESC
    `;

    const result = await this.dataSource.query(query);
    return result.map((row: ActivityLog) => this.rowToModel(row));
  }

  async findByEntity(entity: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        employee_id,
        occurred_at,
        request_info
      FROM ${DATABASE_CORE_MODELS.ACTIVITYLOGS}
      WHERE entity = $1
      ORDER BY occurred_at DESC
    `;

    const result = await this.dataSource.query(query, [entity]);
    return result.map((row: ActivityLog) => this.rowToModel(row));
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        employee_id,
        occurred_at,
        request_info
      FROM ${DATABASE_CORE_MODELS.ACTIVITYLOGS}
      WHERE action = $1
      ORDER BY occurred_at DESC
    `;

    const result = await this.dataSource.query(query, [action]);
    return result.map((row: ActivityLog) => this.rowToModel(row));
  }

  /**
   * Converts raw database row to domain model
   * Handles conversion from database result (JSON) to domain model
   * Works with both MySQL and PostgreSQL JSON columns
   */
  private rowToModel(row: any): ActivityLog {
    // Handle JSON details - database drivers may return JSON as string or parsed object
    let detailsString = '';
    if (row.details !== null && row.details !== undefined) {
      if (typeof row.details === 'string') {
        // Already a string (MySQL or PostgreSQL returning as text)
        detailsString = row.details;
      } else if (typeof row.details === 'object') {
        // Parsed object (PostgreSQL driver auto-parsing JSONB/JSON)
        detailsString = JSON.stringify(row.details);
      } else {
        // Fallback for unexpected types
        detailsString = String(row.details);
      }
    }

    // Handle JSON request_info - database drivers may return JSON as string or parsed object
    let requestInfo = '';
    if (row.request_info !== null && row.request_info !== undefined) {
      if (typeof row.request_info === 'string') {
        // Already a st ring (MySQL or PostgreSQL returning as text)
        requestInfo = row.request_info;
      } else if (typeof row.request_info === 'object') {
        // Parsed object (PostgreSQL driver auto-parsing JSONB/JSON)
        requestInfo = JSON.stringify(row.request_info);
      } else {
        // Fallback for unexpected types
        requestInfo = String(row.request_info);
      }
    }

    const log = new ActivityLog({
      id: row.id,
      action: row.action,
      entity: row.entity,
      details: detailsString,
      employee_id: row.employee_id || undefined,
      request_info: requestInfo,
      occurred_at: row.occurred_at,
    });

    return log;
  }
}
