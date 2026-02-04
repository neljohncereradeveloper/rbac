import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { RoleEntity } from '@/features/rbac/infrastructure/database/entities/role.entity';
import { getPHDateTime } from '@/core/utils/date.util';
import { ROLES } from '@/core/domain/constants';

/**
 * SeedRoles
 *
 * This seed class populates the roles table with default role values.
 *
 * PURPOSE:
 * Roles are named groupings of permissions that can be assigned to users.
 * They simplify permission management by grouping related permissions together.
 *
 * USAGE:
 * This seed creates default roles:
 * - Admin: Full access to all resources
 * - Editor: Can create, read, and update resources (no delete/archive)
 * - Viewer: Read-only access to resources
 *
 * NOTE:
 * The seed is idempotent - running it multiple times will not create duplicates.
 * Roles are checked by their unique name field.
 */
export class SeedRoles {
  private readonly logger = new Logger(SeedRoles.name);

  constructor(private readonly entityManager: EntityManager) { }

  /**
   * Executes the seed operation to create default role entries.
   *
   * This method:
   * 1. Defines default roles with descriptions
   * 2. Checks if each role already exists in the database (by name)
   * 3. Creates new role records only if they don't exist (idempotent operation)
   * 4. Logs the creation or existence of each role
   *
   * The seed is idempotent - running it multiple times will not create duplicates.
   */
  async run(): Promise<Map<string, number>> {
    /**
     * Default role entries.
     * Format: { name, description }
     */
    const roles = [
      {
        name: ROLES.ADMIN,
        description:
          'Administrator role with full access to all resources and permissions',
      },
      {
        name: ROLES.EDITOR,
        description:
          'Editor role with create, read, and update access (no delete/archive)',
      },
      {
        name: ROLES.VIEWER,
        description: 'Viewer role with read-only access to resources',
      },
    ];

    /**
     * Map to store role names to their IDs for use in role-permission seeding
     */
    const roleMap = new Map<string, number>();

    /**
     * Process each role:
     * - Check if role already exists (by name field)
     * - Create new role if it doesn't exist
     * - Log the operation result
     * - Store role ID in map for later use
     */
    for (const role of roles) {
      const existing_role = await this.entityManager.findOne(RoleEntity, {
        where: { name: role.name },
        withDeleted: true,
      });

      if (!existing_role) {
        const role_entity = this.entityManager.create(RoleEntity, {
          name: role.name,
          description: role.description,
          created_by: 'auto generated',
          created_at: getPHDateTime(),
        });

        const saved_role = await this.entityManager.save(role_entity);
        roleMap.set(role.name, saved_role.id);
        this.logger.log(`Created role: ${role.name}`);
      } else {
        roleMap.set(role.name, existing_role.id);
        this.logger.log(`Role already exists: ${role.name}`);
      }
    }

    return roleMap;
  }
}
