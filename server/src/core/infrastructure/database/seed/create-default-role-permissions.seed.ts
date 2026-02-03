import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { RolePermissionEntity } from '@/features/rbac/infrastructure/database/entities/role-permission.entity';
import { getPHDateTime } from '@/core/utils/date.util';

/**
 * SeedRolePermissions
 *
 * This seed class links default roles to their permissions.
 *
 * PURPOSE:
 * Role-permission links define which permissions each role has access to.
 * This establishes the authorization structure of the RBAC system.
 *
 * USAGE:
 * This seed creates role-permission links:
 * - Admin: All permissions
 * - Editor: Create, read, update permissions (no archive/restore)
 * - Viewer: Read-only permissions (read, combobox, paginated_list)
 *
 * NOTE:
 * The seed is idempotent - running it multiple times will not create duplicates.
 * Role-permission links are checked by the unique combination of role_id and permission_id.
 */
export class SeedRolePermissions {
  private readonly logger = new Logger(SeedRolePermissions.name);

  constructor(private readonly entityManager: EntityManager) { }

  /**
   * Executes the seed operation to create default role-permission links.
   *
   * This method:
   * 1. Defines which permissions each role should have
   * 2. Checks if each role-permission link already exists
   * 3. Creates new links only if they don't exist (idempotent operation)
   * 4. Logs the creation or existence of each link
   *
   * @param roleMap Map of role names to role IDs (from SeedRoles)
   * @param permissionMap Map of permission names to permission IDs (from SeedPermissions)
   *
   * The seed is idempotent - running it multiple times will not create duplicates.
   */
  async run(
    roleMap: Map<string, number>,
    permissionMap: Map<string, number>,
  ): Promise<void> {
    /**
     * Define role-permission mappings.
     * Format: { roleName: [permissionName1, permissionName2, ...] }
     */
    const rolePermissionMappings: Record<string, string[]> = {
      Admin: [
        // All role permissions
        'roles:create',
        'roles:read',
        'roles:update',
        'roles:archive',
        'roles:restore',
        'roles:assign_permissions',
        'roles:remove_permissions',
        'roles:combobox',
        'roles:paginated_list',
        // All permission permissions
        'permissions:create',
        'permissions:read',
        'permissions:update',
        'permissions:archive',
        'permissions:restore',
        'permissions:combobox',
        'permissions:paginated_list',
        // All user permissions
        'users:create',
        'users:read',
        'users:update',
        'users:archive',
        'users:restore',
        'users:change_password',
        'users:verify_email',
        'users:combobox',
        'users:paginated_list',
        // All user-role permissions
        'user_roles:assign_roles',
        'user_roles:remove_roles',
        // All user-permission permissions
        'user_permissions:grant_permissions',
        'user_permissions:deny_permissions',
        'user_permissions:remove_overrides',
      ],
      Editor: [
        // Role permissions (no archive/restore)
        'roles:create',
        'roles:read',
        'roles:update',
        'roles:combobox',
        'roles:paginated_list',
        // Permission permissions (no archive/restore)
        'permissions:create',
        'permissions:read',
        'permissions:update',
        'permissions:combobox',
        'permissions:paginated_list',
        // User permissions (no archive/restore)
        'users:create',
        'users:read',
        'users:update',
        'users:combobox',
        'users:paginated_list',
      ],
      Viewer: [
        // Read-only role permissions
        'roles:read',
        'roles:combobox',
        'roles:paginated_list',
        // Read-only permission permissions
        'permissions:read',
        'permissions:combobox',
        'permissions:paginated_list',
        // Read-only user permissions
        'users:read',
        'users:combobox',
        'users:paginated_list',
      ],
    };

    /**
     * Process each role and its assigned permissions:
     * - Get role ID from roleMap
     * - For each permission name, get permission ID from permissionMap
     * - Check if role-permission link already exists
     * - Create new link if it doesn't exist
     * - Log the operation result
     */
    for (const [roleName, permissionNames] of Object.entries(
      rolePermissionMappings,
    )) {
      const roleId = roleMap.get(roleName);

      if (!roleId) {
        this.logger.warn(
          `Role "${roleName}" not found in roleMap. Skipping permissions assignment.`,
        );
        continue;
      }

      for (const permissionName of permissionNames) {
        const permissionId = permissionMap.get(permissionName);

        if (!permissionId) {
          this.logger.warn(
            `Permission "${permissionName}" not found in permissionMap. Skipping.`,
          );
          continue;
        }

        // Check if role-permission link already exists
        const existing_link = await this.entityManager.findOne(
          RolePermissionEntity,
          {
            where: {
              role_id: roleId,
              permission_id: permissionId,
            },
          },
        );

        if (!existing_link) {
          const role_permission_entity = this.entityManager.create(
            RolePermissionEntity,
            {
              role_id: roleId,
              permission_id: permissionId,
              created_by: 'auto generated',
              created_at: getPHDateTime(),
            },
          );

          await this.entityManager.save(role_permission_entity);
          this.logger.log(
            `Created role-permission link: ${roleName} -> ${permissionName}`,
          );
        } else {
          this.logger.log(
            `Role-permission link already exists: ${roleName} -> ${permissionName}`,
          );
        }
      }
    }
  }
}
