import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PermissionRepository } from '@/features/rbac/domain/repositories';
import { Permission } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';

@Injectable()
export class PermissionRepositoryImpl implements PermissionRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) { }

  // Note: create() and update() methods removed - permissions are statically defined and managed via seeders only

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<Permission | null> {
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.PERMISSIONS}
      WHERE id = $1
    `;

    const result = await manager.query(query, [id]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  // Note: findPaginatedList() method removed - permissions are fetched without pagination
  // Permissions are statically defined and managed via seeders only

  async findAll(manager: EntityManager): Promise<Permission[]> {
    // Fetch all permissions without any filtering conditions
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.PERMISSIONS}
      ORDER BY resource ASC, name ASC
    `;

    const result = await manager.query(query);
    return result.map((row: any) => this.entityToModel(row));
  }

  async findByName(
    name: string,
    manager: EntityManager,
  ): Promise<Permission | null> {
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.PERMISSIONS}
      WHERE name = $1 AND deleted_at IS NULL
    `;

    const result = await manager.query(query, [name]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
    manager: EntityManager,
  ): Promise<Permission | null> {
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.PERMISSIONS}
      WHERE resource = $1 AND action = $2 AND deleted_at IS NULL
    `;

    const result = await manager.query(query, [resource, action]);
    if (result.length === 0) {
      return null;
    }

    return this.entityToModel(result[0]);
  }

  // Note: combobox() method removed - not used in web app

  /**
   * Converts database entity to domain model
   */
  private entityToModel(entity: any): Permission {
    return new Permission({
      id: entity.id,
      name: entity.name,
      resource: entity.resource,
      action: entity.action,
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
