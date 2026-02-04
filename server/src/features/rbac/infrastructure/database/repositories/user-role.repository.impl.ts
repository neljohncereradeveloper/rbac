import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UserRoleRepository } from '@/features/rbac/domain/repositories';
import { UserRole } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';
import { USER_MANAGEMENT_DATABASE_MODELS } from '@/features/user-management/domain/constants';

@Injectable()
export class UserRoleRepositoryImpl implements UserRoleRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  async create(user_role: UserRole, manager: EntityManager): Promise<UserRole> {
    const query = `
      INSERT INTO ${RBAC_DATABASE_MODELS.USER_ROLES} (
        user_id, role_id, created_by, created_at
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, role_id) DO NOTHING
      RETURNING *
    `;

    const result = await manager.query(query, [
      user_role.user_id,
      user_role.role_id,
      user_role.created_by,
      user_role.created_at,
    ]);

    if (result.length === 0) {
      // Conflict occurred, fetch existing record
      const existingQuery = `
        SELECT *
        FROM ${RBAC_DATABASE_MODELS.USER_ROLES}
        WHERE user_id = $1 AND role_id = $2
      `;
      const existingResult = await manager.query(existingQuery, [
        user_role.user_id,
        user_role.role_id,
      ]);
      return this.entityToModel(existingResult[0]);
    }

    return this.entityToModel(result[0]);
  }

  async assignToUser(
    user_id: number,
    role_ids: number[],
    manager: EntityManager,
    replace: boolean = false,
  ): Promise<void> {
    if (role_ids.length === 0) {
      return;
    }

    // If replace is true, remove all existing roles first
    if (replace) {
      await this.removeFromUser(user_id, [], manager);
    }

    // Insert new roles (ignore duplicates)
    const insertParams: any[] = [];
    const valuesPlaceholders: string[] = [];
    let paramIndex = 1;
    const now = new Date();

    role_ids.forEach((role_id) => {
      valuesPlaceholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
      );
      insertParams.push(user_id, role_id, null, now);
    });

    const insertQuery = `
      INSERT INTO ${RBAC_DATABASE_MODELS.USER_ROLES} (
        user_id, role_id, created_by, created_at
      )
      VALUES ${valuesPlaceholders.join(', ')}
      ON CONFLICT (user_id, role_id) DO NOTHING
    `;

    await manager.query(insertQuery, insertParams);
  }

  async removeFromUser(
    user_id: number,
    role_ids: number[],
    manager: EntityManager,
  ): Promise<void> {
    if (role_ids.length === 0) {
      // Remove all roles for the user
      const query = `
        DELETE FROM ${RBAC_DATABASE_MODELS.USER_ROLES}
        WHERE user_id = $1
      `;
      await manager.query(query, [user_id]);
    } else {
      // Remove specific roles
      const query = `
        DELETE FROM ${RBAC_DATABASE_MODELS.USER_ROLES}
        WHERE user_id = $1 AND role_id = ANY($2::int[])
      `;
      await manager.query(query, [user_id, role_ids]);
    }
  }

  async findRoleIdsByUserId(
    user_id: number,
    manager: EntityManager,
  ): Promise<number[]> {
    const query = `
      SELECT role_id
      FROM ${RBAC_DATABASE_MODELS.USER_ROLES}
      WHERE user_id = $1
      ORDER BY role_id ASC
    `;

    const result = await manager.query(query, [user_id]);
    return result.map((row: any) => row.role_id);
  }

  async findByUserId(
    user_id: number,
    manager: EntityManager,
  ): Promise<UserRole[]> {
    const query = `
      SELECT
        ur.user_id,
        ur.role_id,
        ur.created_by,
        ur.created_at,
        u.username,
        r.description AS role_description
      FROM ${RBAC_DATABASE_MODELS.USER_ROLES} ur
      INNER JOIN ${USER_MANAGEMENT_DATABASE_MODELS.USERS} u ON u.id = ur.user_id
      INNER JOIN ${RBAC_DATABASE_MODELS.ROLES} r ON r.id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY ur.role_id ASC
    `;

    const result = await manager.query(query, [user_id]);
    return result.map((row: any) => this.entityToModel(row));
  }

  async exists(
    user_id: number,
    role_id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${RBAC_DATABASE_MODELS.USER_ROLES}
      WHERE user_id = $1 AND role_id = $2
    `;

    const result = await manager.query(query, [user_id, role_id]);
    return parseInt(result[0].count, 10) > 0;
  }

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): UserRole {
    return new UserRole({
      user_id: entity.user_id,
      role_id: entity.role_id,
      created_by: entity.created_by ?? null,
      created_at: entity.created_at,
      username: entity.username,
      role_description: entity.role_description ?? null,
    });
  }
}
