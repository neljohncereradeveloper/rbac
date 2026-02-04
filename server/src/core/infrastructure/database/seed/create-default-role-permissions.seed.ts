import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { RolePermissionEntity } from '@/features/rbac/infrastructure/database/entities/role-permission.entity';
import { getPHDateTime } from '@/core/utils/date.util';
import { ROLES, PERMISSIONS } from '@/core/domain/constants';

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
 * - Admin: All permissions (roles, permissions, users, user_roles, user_permissions, holidays)
 * - Editor: Create, read, update permissions (no archive/restore) for roles, permissions, users, holidays
 * - Viewer: Read-only permissions (read, combobox, paginated_list) for roles, permissions, users, holidays
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
      [ROLES.ADMIN]: [
        // All role permissions
        PERMISSIONS.ROLES.CREATE,
        PERMISSIONS.ROLES.READ,
        PERMISSIONS.ROLES.UPDATE,
        PERMISSIONS.ROLES.ARCHIVE,
        PERMISSIONS.ROLES.RESTORE,
        PERMISSIONS.ROLES.ASSIGN_PERMISSIONS,
        PERMISSIONS.ROLES.REMOVE_PERMISSIONS,
        PERMISSIONS.ROLES.COMBOBOX,
        PERMISSIONS.ROLES.PAGINATED_LIST,
        // All permission permissions
        PERMISSIONS.PERMISSIONS.CREATE,
        PERMISSIONS.PERMISSIONS.READ,
        PERMISSIONS.PERMISSIONS.UPDATE,
        PERMISSIONS.PERMISSIONS.ARCHIVE,
        PERMISSIONS.PERMISSIONS.RESTORE,
        PERMISSIONS.PERMISSIONS.COMBOBOX,
        PERMISSIONS.PERMISSIONS.PAGINATED_LIST,
        // All user permissions
        PERMISSIONS.USERS.CREATE,
        PERMISSIONS.USERS.READ,
        PERMISSIONS.USERS.UPDATE,
        PERMISSIONS.USERS.ARCHIVE,
        PERMISSIONS.USERS.RESTORE,
        PERMISSIONS.USERS.CHANGE_PASSWORD,
        PERMISSIONS.USERS.VERIFY_EMAIL,
        PERMISSIONS.USERS.COMBOBOX,
        PERMISSIONS.USERS.PAGINATED_LIST,
        // All user-role permissions
        PERMISSIONS.USER_ROLES.READ,
        PERMISSIONS.USER_ROLES.ASSIGN_ROLES,
        PERMISSIONS.USER_ROLES.REMOVE_ROLES,
        // All user-permission permissions
        PERMISSIONS.USER_PERMISSIONS.READ,
        PERMISSIONS.USER_PERMISSIONS.GRANT_PERMISSIONS,
        PERMISSIONS.USER_PERMISSIONS.DENY_PERMISSIONS,
        PERMISSIONS.USER_PERMISSIONS.REMOVE_OVERRIDES,
        // All holiday permissions
        PERMISSIONS.HOLIDAYS.CREATE,
        PERMISSIONS.HOLIDAYS.READ,
        PERMISSIONS.HOLIDAYS.UPDATE,
        PERMISSIONS.HOLIDAYS.ARCHIVE,
        PERMISSIONS.HOLIDAYS.RESTORE,
        PERMISSIONS.HOLIDAYS.COMBOBOX,
        PERMISSIONS.HOLIDAYS.PAGINATED_LIST,
      ],
      [ROLES.EDITOR]: [
        // Role permissions (no archive/restore)
        PERMISSIONS.ROLES.CREATE,
        PERMISSIONS.ROLES.READ,
        PERMISSIONS.ROLES.UPDATE,
        PERMISSIONS.ROLES.COMBOBOX,
        PERMISSIONS.ROLES.PAGINATED_LIST,
        // Permission permissions (no archive/restore)
        PERMISSIONS.PERMISSIONS.CREATE,
        PERMISSIONS.PERMISSIONS.READ,
        PERMISSIONS.PERMISSIONS.UPDATE,
        PERMISSIONS.PERMISSIONS.COMBOBOX,
        PERMISSIONS.PERMISSIONS.PAGINATED_LIST,
        // User permissions (no archive/restore)
        PERMISSIONS.USERS.CREATE,
        PERMISSIONS.USERS.READ,
        PERMISSIONS.USERS.UPDATE,
        PERMISSIONS.USERS.COMBOBOX,
        PERMISSIONS.USERS.PAGINATED_LIST,
        // User-role permissions (read only for Editor)
        PERMISSIONS.USER_ROLES.READ,
        // User-permission permissions (read only for Editor)
        PERMISSIONS.USER_PERMISSIONS.READ,
        // Holiday permissions (no archive/restore)
        PERMISSIONS.HOLIDAYS.CREATE,
        PERMISSIONS.HOLIDAYS.READ,
        PERMISSIONS.HOLIDAYS.UPDATE,
        PERMISSIONS.HOLIDAYS.COMBOBOX,
        PERMISSIONS.HOLIDAYS.PAGINATED_LIST,
      ],
      [ROLES.VIEWER]: [
        // Read-only role permissions
        PERMISSIONS.ROLES.READ,
        PERMISSIONS.ROLES.COMBOBOX,
        PERMISSIONS.ROLES.PAGINATED_LIST,
        // Read-only permission permissions
        PERMISSIONS.PERMISSIONS.READ,
        PERMISSIONS.PERMISSIONS.COMBOBOX,
        PERMISSIONS.PERMISSIONS.PAGINATED_LIST,
        // Read-only user permissions
        PERMISSIONS.USERS.READ,
        PERMISSIONS.USERS.COMBOBOX,
        PERMISSIONS.USERS.PAGINATED_LIST,
        // Read-only user-role permissions
        PERMISSIONS.USER_ROLES.READ,
        // Read-only user-permission permissions
        PERMISSIONS.USER_PERMISSIONS.READ,
        // Read-only holiday permissions
        PERMISSIONS.HOLIDAYS.READ,
        PERMISSIONS.HOLIDAYS.COMBOBOX,
        PERMISSIONS.HOLIDAYS.PAGINATED_LIST,
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
