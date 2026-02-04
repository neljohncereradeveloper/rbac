import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { Role } from '@/features/rbac/domain/models';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';

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

  // Note: findPaginatedList() method removed - roles are fetched without pagination
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only

  async findAll(manager: EntityManager): Promise<Role[]> {
    // Fetch all roles without any filtering conditions
    const query = `
      SELECT *
      FROM ${RBAC_DATABASE_MODELS.ROLES}
      ORDER BY name ASC
    `;

    const result = await manager.query(query);
    return result.map((row: any) => this.entityToModel(row));
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

  // Note: combobox() method removed - not used in web app

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
