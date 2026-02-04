import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UserRepository } from '@/features/user-management/domain/repositories';
import { User } from '@/features/user-management/domain/models';
import { USER_MANAGEMENT_DATABASE_MODELS } from '@/features/user-management/domain/constants';
import {
  PaginatedResult,
  calculatePagination,
} from '@/core/utils/pagination.util';

@Injectable()
export class UserRepositoryImpl implements UserRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  async create(user: User, manager: EntityManager): Promise<User> {
    const query = `
      INSERT INTO ${USER_MANAGEMENT_DATABASE_MODELS.USERS} (
        username, email, password, first_name, middle_name, last_name,
        phone, date_of_birth, is_active, is_email_verified,
        is_email_verified_at, deleted_by, deleted_at, created_by,
        created_at, updated_by, updated_at, change_password_by,
        change_password_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const result = await manager.query(query, [
      user.username,
      user.email,
      user.password,
      user.first_name,
      user.middle_name,
      user.last_name,
      user.phone,
      user.date_of_birth,
      user.is_active,
      user.is_email_verified,
      user.is_email_verified_at,
      user.deleted_by,
      user.deleted_at,
      user.created_by,
      user.created_at,
      user.updated_by,
      user.updated_at,
      user.change_password_by,
      user.change_password_at,
    ]);

    const savedEntity = result[0];
    return this.entityToModel(savedEntity);
  }

  async update(
    id: number,
    dto: Partial<User>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.username !== undefined) {
      updateFields.push(`username = $${paramIndex++}`);
      values.push(dto.username);
    }
    if (dto.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push(dto.email);
    }
    if (dto.password !== undefined) {
      updateFields.push(`password = $${paramIndex++}`);
      values.push(dto.password);
    }
    if (dto.first_name !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(dto.first_name);
    }
    if (dto.middle_name !== undefined) {
      updateFields.push(`middle_name = $${paramIndex++}`);
      values.push(dto.middle_name);
    }
    if (dto.last_name !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(dto.last_name);
    }
    if (dto.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(dto.phone);
    }
    if (dto.date_of_birth !== undefined) {
      updateFields.push(`date_of_birth = $${paramIndex++}`);
      values.push(dto.date_of_birth);
    }
    if (dto.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      values.push(dto.is_active);
    }
    if (dto.is_email_verified !== undefined) {
      updateFields.push(`is_email_verified = $${paramIndex++}`);
      values.push(dto.is_email_verified);
    }
    if (dto.is_email_verified_at !== undefined) {
      updateFields.push(`is_email_verified_at = $${paramIndex++}`);
      values.push(dto.is_email_verified_at);
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
    if (dto.change_password_by !== undefined) {
      updateFields.push(`change_password_by = $${paramIndex++}`);
      values.push(dto.change_password_by);
    }
    if (dto.change_password_at !== undefined) {
      updateFields.push(`change_password_at = $${paramIndex++}`);
      values.push(dto.change_password_at);
    }

    if (updateFields.length === 0) {
      return false;
    }

    values.push(id);

    const query = `
      UPDATE ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id
    `;

    const result = await manager.query(query, values);
    return result.length > 0;
  }

  async changePassword(
    id: number,
    user: User,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      UPDATE ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      SET password = $1, change_password_by = $2, change_password_at = $3, updated_by = $4
      WHERE id = $5
      RETURNING id
    `;

    const result = await manager.query(query, [
      user.password,
      user.change_password_by,
      user.change_password_at,
      user.updated_by,
      id,
    ]);

    return result.length > 0;
  }

  async findById(id: number, manager: EntityManager): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
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
  ): Promise<PaginatedResult<User>> {
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
        username ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        first_name ILIKE $${paramIndex} OR
        last_name ILIKE $${paramIndex}
      )`;
      queryParams.push(searchTerm);
      paramIndex++;
    }

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      ${whereClause}
    `;

    const countResult = await manager.query(countQuery, queryParams);
    const totalRecords = parseInt(countResult[0].total, 10);

    // Fetch paginated data
    const dataQuery = `
      SELECT *
      FROM ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const dataResult = await manager.query(dataQuery, queryParams);

    const users = dataResult.map((row: any) => this.entityToModel(row));

    return {
      data: users,
      meta: calculatePagination(totalRecords, page, limit),
    };
  }

  async findByUsername(
    username: string,
    manager: EntityManager,
  ): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      WHERE username = $1
    `;

    const result = await manager.query(query, [username]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  async findByEmail(
    email: string,
    manager: EntityManager,
  ): Promise<User | null> {
    const query = `
      SELECT *
      FROM ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      WHERE email = $1
    `;

    const result = await manager.query(query, [email]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  async combobox(manager: EntityManager): Promise<User[]> {
    const query = `
      SELECT id, username, email, first_name, last_name
      FROM ${USER_MANAGEMENT_DATABASE_MODELS.USERS}
      WHERE deleted_at IS NULL AND is_active = true
      ORDER BY username ASC
    `;

    const result = await manager.query(query);
    return result.map((row: any) => this.entityToModel(row));
  }

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): User {
    return new User({
      id: entity.id,
      username: entity.username,
      email: entity.email,
      password: entity.password ?? null,
      first_name: entity.first_name ?? null,
      middle_name: entity.middle_name ?? null,
      last_name: entity.last_name ?? null,
      phone: entity.phone ?? null,
      date_of_birth: entity.date_of_birth ?? null,
      is_active: entity.is_active ?? true,
      is_email_verified: entity.is_email_verified ?? false,
      is_email_verified_at: entity.is_email_verified_at ?? null,
      deleted_by: entity.deleted_by ?? null,
      deleted_at: entity.deleted_at ?? null,
      created_by: entity.created_by ?? null,
      created_at: entity.created_at,
      updated_by: entity.updated_by ?? null,
      updated_at: entity.updated_at,
      change_password_by: entity.change_password_by ?? null,
      change_password_at: entity.change_password_at ?? null,
    });
  }
}
