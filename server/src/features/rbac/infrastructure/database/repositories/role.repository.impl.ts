import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { Role } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';
import { PaginatedResult, calculatePagination } from '@/core/utils/pagination.util';

@Injectable()
export class RoleRepositoryImpl implements RoleRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  async create(
    role: Role,
    manager: EntityManager,
    permission_ids?: number[],
  ): Promise<Role> {
    const query = `
      INSERT INTO ${RBAC_DATABASE_MODELS.ROLES} (
        name, description, deleted_by, deleted_at, created_by,
        created_at, updated_by, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await manager.query(query, [
      role.name,
      role.description,
      role.deleted_by,
      role.deleted_at,
      role.created_by,
      role.created_at,
      role.updated_by,
      role.updated_at,
    ]);

    const savedEntity = result[0];
    const createdRole = this.entityToModel(savedEntity);

    // If permission_ids are provided, create role-permission links
    if (permission_ids && permission_ids.length > 0 && createdRole.id) {
      const rolePermissionParams: any[] = [];
      const valuesPlaceholders: string[] = [];
      let paramIndex = 1;

      permission_ids.forEach((permission_id) => {
        valuesPlaceholders.push(
          `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
        );
        rolePermissionParams.push(
          createdRole.id,
          permission_id,
          role.created_by,
          role.created_at,
        );
      });

      const rolePermissionQuery = `
        INSERT INTO ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS} (
          role_id, permission_id, created_by, created_at
        )
        VALUES ${valuesPlaceholders.join(', ')}
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `;

      await manager.query(rolePermissionQuery, rolePermissionParams);
    }

    return createdRole;
  }

  async update(
    id: number,
    dto: Partial<Role>,
    manager: EntityManager,
  ): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(dto.description);
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
      UPDATE ${RBAC_DATABASE_MODELS.ROLES}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await manager.query(query, values);
    return result.length > 0;
  }

  async findById(id: number, manager: EntityManager): Promise<Role | null> {
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      WHERE id = $1 AND deleted_at IS NULL
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
