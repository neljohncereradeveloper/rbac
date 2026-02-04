import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { Role } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';
import {
  PaginatedResult,
  calculatePagination,
} from '@/core/utils/pagination.util';

@Injectable()
export class RoleRepositoryImpl implements RoleRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  // Note: create() and update() methods removed
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  // These methods are not used since roles cannot be created or updated via the application

  async findById(id: number, manager: EntityManager): Promise<Role | null> {
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.ROLES}
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
  ): Promise<PaginatedResult<Role>> {
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
        description ILIKE $${paramIndex}
      )`;
      queryParams.push(searchTerm);
      paramIndex++;
    }

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      ${whereClause}
    `;

    const countResult = await manager.query(countQuery, queryParams);
    const totalRecords = parseInt(countResult[0].total, 10);

    // Fetch paginated data
    const dataQuery = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const dataResult = await manager.query(dataQuery, queryParams);

    const roles = dataResult.map((row: any) => this.entityToModel(row));

    return {
      data: roles,
      meta: calculatePagination(totalRecords, page, limit),
    };
  }

  async findAll(
    term: string,
    is_archived: boolean,
    manager: EntityManager,
  ): Promise<Role[]> {
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
        description ILIKE $${paramIndex}
      )`;
      queryParams.push(searchTerm);
      paramIndex++;
    }

    // Fetch all data
    const dataQuery = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      ${whereClause}
      ORDER BY name ASC
    `;

    const dataResult = await manager.query(dataQuery, queryParams);
    return dataResult.map((row: any) => this.entityToModel(row));
  }

  async findByName(name: string, manager: EntityManager): Promise<Role | null> {
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      WHERE name = $1 AND deleted_at IS NULL
    `;

    const result = await manager.query(query, [name]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  async combobox(manager: EntityManager): Promise<Role[]> {
    const query = `
      SELECT id, name, description
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      WHERE deleted_at IS NULL
      ORDER BY name ASC
    `;

    const result = await manager.query(query);
    return result.map((row: any) => this.entityToModel(row));
  }

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): Role {
    return new Role({
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      deleted_by: entity.deleted_by ?? null,
      deleted_at: entity.deleted_at ?? null,
      created_by: entity.created_by ?? null,
      created_at: entity.created_at,
      updated_by: entity.updated_by ?? null,
      updated_at: entity.updated_at,
    });
  }
}
