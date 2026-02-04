import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { HolidayRepository } from '@/features/holiday-management/domain/repositories';
import { Holiday } from '@/features/holiday-management/domain/models';
import { HOLIDAY_MANAGEMENT_DATABASE_MODELS } from '@/features/holiday-management/domain/constants';
import {
  PaginatedResult,
  calculatePagination,
} from '@/core/utils/pagination.util';

@Injectable()
export class HolidayRepositoryImpl implements HolidayRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  async create(holiday: Holiday, manager: EntityManager): Promise<Holiday> {
    const query = `
      INSERT INTO ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS} (
        name, date, type, description, is_recurring, deleted_by, deleted_at,
        created_by, created_at, updated_by, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await manager.query(query, [
      holiday.name,
      holiday.date,
      holiday.type,
      holiday.description,
      holiday.is_recurring,
      holiday.deleted_by,
      holiday.deleted_at,
      holiday.created_by,
      holiday.created_at,
      holiday.updated_by,
      holiday.updated_at,
    ]);

    const savedEntity = result[0];
    return this.entityToModel(savedEntity);
  }

  async update(
    id: number,
    dto: Partial<Holiday>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.date !== undefined) {
      updateFields.push(`date = $${paramIndex++}`);
      values.push(dto.date);
    }
    if (dto.type !== undefined) {
      updateFields.push(`type = $${paramIndex++}`);
      values.push(dto.type);
    }
    if (dto.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(dto.description);
    }
    if (dto.is_recurring !== undefined) {
      updateFields.push(`is_recurring = $${paramIndex++}`);
      values.push(dto.is_recurring);
    }
    if (dto.deleted_by !== undefined) {
      updateFields.push(`deleted_by = $${paramIndex++}`);
      values.push(dto.deleted_by);
    }
    if (dto.deleted_at !== undefined) {
      updateFields.push(`deleted_at = $${paramIndex++}`);
      values.push(dto.deleted_at);
    }
    if (dto.updated_by !== undefined) {
      updateFields.push(`updated_by = $${paramIndex++}`);
      values.push(dto.updated_by);
    }

    if (updateFields.length === 0) {
      return false;
    }

    values.push(id);

    const query = `
      UPDATE ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await manager.query(query, values);
    return result.length > 0;
  }

  async findById(id: number, manager: EntityManager): Promise<Holiday | null> {
    const query = `
      SELECT *
      FROM ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS}
      WHERE id = $1
    `;

    const result = await manager.query(query, [id]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    manager: EntityManager,
  ): Promise<PaginatedResult<Holiday>> {
    const offset = (page - 1) * limit;
    const searchTerm = term ? `%${term}%` : '%';

    // Build WHERE clause
    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (is_archived) {
      whereClause = 'WHERE deleted_at IS NOT NULL';
    } else {
      whereClause = 'WHERE deleted_at IS NULL';
    }

    // Add search term if provided
    if (term) {
      whereClause += ` AND (
        name ILIKE $${paramIndex} OR
        type ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex}
      )`;
      queryParams.push(searchTerm);
      paramIndex++;
    }

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS}
      ${whereClause}
    `;

    const countResult = await manager.query(countQuery, queryParams);
    const totalRecords = parseInt(countResult[0].total, 10);

    // Fetch paginated data
    const dataQuery = `
      SELECT *
      FROM ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS}
      ${whereClause}
      ORDER BY date ASC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const dataResult = await manager.query(dataQuery, queryParams);

    const holidays = dataResult.map((row: any) => this.entityToModel(row));

    return {
      data: holidays,
      meta: calculatePagination(totalRecords, page, limit),
    };
  }

  async findByDateRange(
    start_date: Date,
    end_date: Date,
    manager: EntityManager,
  ): Promise<Holiday[]> {
    const query = `
      SELECT *
      FROM ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS}
      WHERE date >= $1 AND date <= $2 AND deleted_at IS NULL
      ORDER BY date ASC
    `;

    const result = await manager.query(query, [start_date, end_date]);
    return result.map((row: any) => this.entityToModel(row));
  }

  async combobox(manager: EntityManager): Promise<Holiday[]> {
    const query = `
      SELECT id, name, date, type
      FROM ${HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS}
      WHERE deleted_at IS NULL
      ORDER BY date ASC, name ASC
    `;

    const result = await manager.query(query);
    return result.map((row: any) => this.entityToModel(row));
  }

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): Holiday {
    return new Holiday({
      id: entity.id,
      name: entity.name,
      date: entity.date,
      type: entity.type,
      description: entity.description ?? null,
      is_recurring: entity.is_recurring ?? false,
      deleted_by: entity.deleted_by ?? null,
      deleted_at: entity.deleted_at ?? null,
      created_by: entity.created_by ?? null,
      created_at: entity.created_at,
      updated_by: entity.updated_by ?? null,
      updated_at: entity.updated_at,
    });
  }
}
