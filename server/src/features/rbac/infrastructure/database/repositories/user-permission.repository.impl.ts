import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UserPermissionRepository } from '@/features/rbac/domain/repositories';
import { UserPermission } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';
import { USER_MANAGEMENT_DATABASE_MODELS } from '@/features/user-management/domain/constants';

@Injectable()
export class UserPermissionRepositoryImpl implements UserPermissionRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  async create(
    user_permission: UserPermission,
    manager: EntityManager,
  ): Promise<UserPermission> {
    const query = `
      INSERT INTO ${RBAC_DATABASE_MODELS.USER_PERMISSIONS} (
        user_id, permission_id, is_allowed, created_by, created_at
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, permission_id) DO UPDATE
      SET is_allowed = EXCLUDED.is_allowed
      RETURNING *
    `;

    const result = await manager.query(query, [
      user_permission.user_id,
      user_permission.permission_id,
      user_permission.is_allowed,
      user_permission.created_by,
      user_permission.created_at,
    ]);

    return this.entityToModel(result[0]);
  }

  async assignToUser(
    user_id: number,
    permission_ids: number[],
    is_allowed: boolean,
    manager: EntityManager,
    replace: boolean = false,
  ): Promise<void> {
    if (permission_ids.length === 0) {
      return;
    }

    // If replace is true, remove all existing overrides first
    if (replace) {
      await this.removeFromUser(user_id, [], manager);
    }

    // Insert or update permissions
    const insertParams: any[] = [];
    const valuesPlaceholders: string[] = [];
    let paramIndex = 1;
    const now = new Date();

    permission_ids.forEach((permission_id) => {
      valuesPlaceholders.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`,
      );
      insertParams.push(user_id, permission_id, is_allowed, null, now);
    });

    const insertQuery = `
      INSERT INTO ${RBAC_DATABASE_MODELS.USER_PERMISSIONS} (
        user_id, permission_id, is_allowed, created_by, created_at
      )
      VALUES ${valuesPlaceholders.join(', ')}
      ON CONFLICT (user_id, permission_id) DO UPDATE
      SET is_allowed = EXCLUDED.is_allowed
    `;

    await manager.query(insertQuery, insertParams);
  }

  async removeFromUser(
    user_id: number,
    permission_ids: number[],
    manager: EntityManager,
  ): Promise<void> {
    if (permission_ids.length === 0) {
      // Remove all permission overrides for the user
      const query = `
        DELETE FROM ${RBAC_DATABASE_MODELS.USER_PERMISSIONS}
        WHERE user_id = $1
      `;
      await manager.query(query, [user_id]);
    } else {
      // Remove specific permission overrides
      const query = `
        DELETE FROM ${RBAC_DATABASE_MODELS.USER_PERMISSIONS}
        WHERE user_id = $1 AND permission_id = ANY($2::int[])
      `;
      await manager.query(query, [user_id, permission_ids]);
    }
  }

  async grantToUser(
    user_id: number,
    permission_ids: number[],
    manager: EntityManager,
  ): Promise<void> {
    await this.assignToUser(user_id, permission_ids, true, manager, false);
  }

  async denyToUser(
    user_id: number,
    permission_ids: number[],
    manager: EntityManager,
  ): Promise<void> {
    await this.assignToUser(user_id, permission_ids, false, manager, false);
  }

  async findByUserId(
    user_id: number,
    manager: EntityManager,
  ): Promise<UserPermission[]> {
    const query = `
      SELECT
        up.user_id,
        up.permission_id,
        up.is_allowed,
        up.created_by,
        up.created_at,
        u.username,
        p.name AS permission_name,
        p.description AS permission_description
      FROM ${RBAC_DATABASE_MODELS.USER_PERMISSIONS} up
      INNER JOIN ${USER_MANAGEMENT_DATABASE_MODELS.USERS} u ON u.id = up.user_id
      INNER JOIN ${RBAC_DATABASE_MODELS.PERMISSIONS} p ON p.id = up.permission_id
      WHERE up.user_id = $1
      ORDER BY up.permission_id ASC
    `;

    const result = await manager.query(query, [user_id]);
    return result.map((row: any) => this.entityToModel(row));
  }

  async findAllowedByUserId(
    user_id: number,
    manager: EntityManager,
  ): Promise<UserPermission[]> {
    const query = `
      SELECT
        up.user_id,
        up.permission_id,
        up.is_allowed,
        up.created_by,
        up.created_at,
        u.username,
        p.name AS permission_name,
        p.description AS permission_description
      FROM ${RBAC_DATABASE_MODELS.USER_PERMISSIONS} up
      INNER JOIN ${USER_MANAGEMENT_DATABASE_MODELS.USERS} u ON u.id = up.user_id
      INNER JOIN ${RBAC_DATABASE_MODELS.PERMISSIONS} p ON p.id = up.permission_id
      WHERE up.user_id = $1 AND up.is_allowed = true
      ORDER BY up.permission_id ASC
    `;

    const result = await manager.query(query, [user_id]);
    return result.map((row: any) => this.entityToModel(row));
  }

  async findDeniedByUserId(
    user_id: number,
    manager: EntityManager,
  ): Promise<UserPermission[]> {
    const query = `
      SELECT
        up.user_id,
        up.permission_id,
        up.is_allowed,
        up.created_by,
        up.created_at,
        u.username,
        p.name AS permission_name,
        p.description AS permission_description
      FROM ${RBAC_DATABASE_MODELS.USER_PERMISSIONS} up
      INNER JOIN ${USER_MANAGEMENT_DATABASE_MODELS.USERS} u ON u.id = up.user_id
      INNER JOIN ${RBAC_DATABASE_MODELS.PERMISSIONS} p ON p.id = up.permission_id
      WHERE up.user_id = $1 AND up.is_allowed = false
      ORDER BY up.permission_id ASC
    `;

    const result = await manager.query(query, [user_id]);
    return result.map((row: any) => this.entityToModel(row));
  }

  async exists(
    user_id: number,
    permission_id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM ${RBAC_DATABASE_MODELS.USER_PERMISSIONS}
      WHERE user_id = $1 AND permission_id = $2
    `;

    const result = await manager.query(query, [user_id, permission_id]);
    return parseInt(result[0].count, 10) > 0;
  }

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): UserPermission {
    return new UserPermission({
      user_id: entity.user_id,
      permission_id: entity.permission_id,
      is_allowed: entity.is_allowed,
      created_by: entity.created_by ?? null,
      created_at: entity.created_at,
      username: entity.username,
      permission_name: entity.permission_name,
      permission_description: entity.permission_description ?? null,
    });
  }
}
