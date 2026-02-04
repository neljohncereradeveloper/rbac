import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RolePermissionRepository } from '@/features/rbac/domain/repositories';
import { RolePermission } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';

@Injectable()
export class RolePermissionRepositoryImpl implements RolePermissionRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  async create(
    role_permission: RolePermission,
    manager: EntityManager,
  ): Promise<RolePermission> {
    const query = `
      INSERT INTO ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS} (
        role_id, permission_id, created_by, created_at
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (role_id, permission_id) DO NOTHING
      RETURNING *
    `;

    const result = await manager.query(query, [
      role_permission.role_id,
      role_permission.permission_id,
      role_permission.created_by,
      role_permission.created_at,
    ]);

    if (result.length === 0) {
      // Conflict occurred, fetch existing record
      const existingQuery = `
        SELECT *
        FROM ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS}
        WHERE role_id = $1 AND permission_id = $2
      `;
      const existingResult = await manager.query(existingQuery, [
        role_permission.role_id,
        role_permission.permission_id,
      ]);
      return this.entityToModel(existingResult[0]);
    }

    return this.entityToModel(result[0]);
  }

  async assignToRole(
    role_id: number,
    permission_ids: number[],
    manager: EntityManager,
    replace: boolean = false,
  ): Promise<void> {
    if (permission_ids.length === 0) {
      return;
    }

    // If replace is true, remove all existing permissions first
    if (replace) {
      await this.removeFromRole(role_id, [], manager);
    }

    // Insert new permissions (ignore duplicates)
    const insertParams: any[] = [];
    const valuesPlaceholders: string[] = [];
    let paramIndex = 1;
    const now = new Date();

    permission_ids.forEach((permission_id) => {
      valuesPlaceholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
      );
      insertParams.push(role_id, permission_id, null, now);
    });

    const insertQuery = `
      INSERT INTO ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS} (
        role_id, permission_id, created_by, created_at
      )
      VALUES ${valuesPlaceholders.join(', ')}
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `;

    await manager.query(insertQuery, insertParams);
  }

  async removeFromRole(
    role_id: number,
    permission_ids: number[],
    manager: EntityManager,
  ): Promise<void> {
    if (permission_ids.length === 0) {
      // Remove all permissions for the role
      const query = `
        DELETE FROM ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS}
        WHERE role_id = $1
      `;
      await manager.query(query, [role_id]);
    } else {
      // Remove specific permissions
      const query = `
        DELETE FROM ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS}
        WHERE role_id = $1 AND permission_id = ANY($2::int[])
      `;
      await manager.query(query, [role_id, permission_ids]);
    }
  }

  async findPermissionIdsByRoleId(
    role_id: number,
    manager: EntityManager,
  ): Promise<number[]> {
    const query = `
      SELECT permission_id
      FROM ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS}
      WHERE role_id = $1
      ORDER BY permission_id ASC
    `;

    const result = await manager.query(query, [role_id]);
    return result.map((row: any) => row.permission_id);
  }

  async findByRoleId(
    role_id: number,
    manager: EntityManager,
  ): Promise<RolePermission[]> {
    const query = `
      SELECT
        rp.role_id,
        rp.permission_id,
        rp.created_by,
        rp.created_at,
        r.name AS role_name,
        r.description AS role_description,
        p.name AS permission_name,
        p.description AS permission_description
      FROM ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS} rp
      INNER JOIN ${RBAC_DATABASE_MODELS.ROLES} r ON r.id = rp.role_id
      INNER JOIN ${RBAC_DATABASE_MODELS.PERMISSIONS} p ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY rp.permission_id ASC
    `;

    const result = await manager.query(query, [role_id]);
    return result.map((row: any) => this.entityToModel(row));
  }

  async exists(
    role_id: number,
    permission_id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${RBAC_DATABASE_MODELS.ROLE_PERMISSIONS}
      WHERE role_id = $1 AND permission_id = $2
    `;

    const result = await manager.query(query, [role_id, permission_id]);
    return parseInt(result[0].count, 10) > 0;
  }

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): RolePermission {
    return new RolePermission({
      role_id: entity.role_id,
      permission_id: entity.permission_id,
      created_by: entity.created_by ?? null,
      created_at: entity.created_at,
      role_name: entity.role_name,
      role_description: entity.role_description ?? null,
      permission_name: entity.permission_name,
      permission_description: entity.permission_description ?? null,
    });
  }
}
