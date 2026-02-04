import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { PermissionEntity } from '@/features/rbac/infrastructure/database/entities/permission.entity';
import { getPHDateTime } from '@/core/utils/date.util';
import {
  PERMISSIONS,
  PERMISSION_RESOURCES,
  PERMISSION_ACTIONS,
} from '@/core/domain/constants';

/**
 * SeedPermissions
 *
 * This seed class populates the permissions table with default permission values.
 *
 * PURPOSE:
 * Permissions define specific capabilities on resources (e.g., users:create, roles:read).
 * They are the foundation of the RBAC system and are assigned to roles.
 *
 * USAGE:
 * This seed creates default permissions for common resources and actions:
 * - Roles: create, read, update, archive, restore, assign_permissions, remove_permissions, combobox, paginated_list
 * - Permissions: create, read, update, archive, restore, combobox, paginated_list
 * - Users: create, read, update, archive, restore, change_password, verify_email, combobox, paginated_list
 * - Holidays: create, read, update, archive, restore, combobox, paginated_list
 *
 * NOTE:
 * The seed is idempotent - running it multiple times will not create duplicates.
 * Permissions are checked by their unique name field.
 */
export class SeedPermissions {
  private readonly logger = new Logger(SeedPermissions.name);

  constructor(private readonly entityManager: EntityManager) { }

  /**
   * Executes the seed operation to create default permission entries.
   *
   * This method:
   * 1. Defines default permissions for common resources and actions
   * 2. Checks if each permission already exists in the database (by name)
   * 3. Creates new permission records only if they don't exist (idempotent operation)
   * 4. Logs the creation or existence of each permission
   *
   * The seed is idempotent - running it multiple times will not create duplicates.
   */
  async run(): Promise<Map<string, number>> {
    /**
     * Default permission entries.
     * Format: { name, resource, action, description }
     */
    const permissions = [
      // Role permissions
      // Note: CREATE, UPDATE, ARCHIVE, RESTORE, ASSIGN_PERMISSIONS removed - roles are statically defined
      // (Admin, Editor, Viewer) and managed via seeders only
      {
        name: PERMISSIONS.ROLES.READ,
        resource: PERMISSION_RESOURCES.ROLES,
        action: PERMISSION_ACTIONS.READ,
        description: 'View role details',
      },
      {
        name: PERMISSIONS.ROLES.COMBOBOX,
        resource: PERMISSION_RESOURCES.ROLES,
        action: PERMISSION_ACTIONS.COMBOBOX,
        description: 'Get roles list for dropdowns',
      },
      {
        name: PERMISSIONS.ROLES.PAGINATED_LIST,
        resource: PERMISSION_RESOURCES.ROLES,
        action: PERMISSION_ACTIONS.PAGINATED_LIST,
        description: 'Get paginated list of roles',
      },
      // Permission permissions
      // Note: CREATE, UPDATE, ARCHIVE, RESTORE removed - permissions are statically defined
      // and managed via seeders only
      {
        name: PERMISSIONS.PERMISSIONS.READ,
        resource: PERMISSION_RESOURCES.PERMISSIONS,
        action: PERMISSION_ACTIONS.READ,
        description: 'View permission details',
      },
      {
        name: PERMISSIONS.PERMISSIONS.COMBOBOX,
        resource: PERMISSION_RESOURCES.PERMISSIONS,
        action: PERMISSION_ACTIONS.COMBOBOX,
        description: 'Get permissions list for dropdowns',
      },
      {
        name: PERMISSIONS.PERMISSIONS.PAGINATED_LIST,
        resource: PERMISSION_RESOURCES.PERMISSIONS,
        action: PERMISSION_ACTIONS.PAGINATED_LIST,
        description: 'Get paginated list of permissions',
      },
      // User permissions
      {
        name: PERMISSIONS.USERS.CREATE,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.CREATE,
        description: 'Create new users',
      },
      {
        name: PERMISSIONS.USERS.READ,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.READ,
        description: 'View user details',
      },
      {
        name: PERMISSIONS.USERS.UPDATE,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.UPDATE,
        description: 'Update user information',
      },
      {
        name: PERMISSIONS.USERS.ARCHIVE,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.ARCHIVE,
        description: 'Archive (soft delete) users',
      },
      {
        name: PERMISSIONS.USERS.RESTORE,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.RESTORE,
        description: 'Restore archived users',
      },
      {
        name: PERMISSIONS.USERS.CHANGE_PASSWORD,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.CHANGE_PASSWORD,
        description: 'Change user passwords',
      },
      {
        name: PERMISSIONS.USERS.VERIFY_EMAIL,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.VERIFY_EMAIL,
        description: 'Verify user email addresses',
      },
      {
        name: PERMISSIONS.USERS.COMBOBOX,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.COMBOBOX,
        description: 'Get users list for dropdowns',
      },
      {
        name: PERMISSIONS.USERS.PAGINATED_LIST,
        resource: PERMISSION_RESOURCES.USERS,
        action: PERMISSION_ACTIONS.PAGINATED_LIST,
        description: 'Get paginated list of users',
      },
      // User-Role permissions
      {
        name: PERMISSIONS.USER_ROLES.READ,
        resource: PERMISSION_RESOURCES.USER_ROLES,
        action: PERMISSION_ACTIONS.READ,
        description: 'View user role assignments',
      },
      {
        name: PERMISSIONS.USER_ROLES.ASSIGN_ROLES,
        resource: PERMISSION_RESOURCES.USER_ROLES,
        action: 'assign_roles',
        description: 'Assign roles to users',
      },
      {
        name: PERMISSIONS.USER_ROLES.REMOVE_ROLES,
        resource: PERMISSION_RESOURCES.USER_ROLES,
        action: 'remove_roles',
        description: 'Remove roles from users',
      },
      // User-Permission permissions
      {
        name: PERMISSIONS.USER_PERMISSIONS.READ,
        resource: PERMISSION_RESOURCES.USER_PERMISSIONS,
        action: PERMISSION_ACTIONS.READ,
        description: 'View user permission overrides',
      },
      {
        name: PERMISSIONS.USER_PERMISSIONS.GRANT_PERMISSIONS,
        resource: PERMISSION_RESOURCES.USER_PERMISSIONS,
        action: 'grant_permissions',
        description: 'Grant permissions directly to users',
      },
      {
        name: PERMISSIONS.USER_PERMISSIONS.DENY_PERMISSIONS,
        resource: PERMISSION_RESOURCES.USER_PERMISSIONS,
        action: 'deny_permissions',
        description: 'Deny permissions directly to users',
      },
      {
        name: PERMISSIONS.USER_PERMISSIONS.REMOVE_OVERRIDES,
        resource: PERMISSION_RESOURCES.USER_PERMISSIONS,
        action: 'remove_overrides',
        description: 'Remove permission overrides from users',
      },
      // Holiday permissions
      {
        name: PERMISSIONS.HOLIDAYS.CREATE,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.CREATE,
        description: 'Create new holidays',
      },
      {
        name: PERMISSIONS.HOLIDAYS.READ,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.READ,
        description: 'View holiday details',
      },
      {
        name: PERMISSIONS.HOLIDAYS.UPDATE,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.UPDATE,
        description: 'Update holiday information',
      },
      {
        name: PERMISSIONS.HOLIDAYS.ARCHIVE,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.ARCHIVE,
        description: 'Archive (soft delete) holidays',
      },
      {
        name: PERMISSIONS.HOLIDAYS.RESTORE,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.RESTORE,
        description: 'Restore archived holidays',
      },
      {
        name: PERMISSIONS.HOLIDAYS.COMBOBOX,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.COMBOBOX,
        description: 'Get holidays list for dropdowns',
      },
      {
        name: PERMISSIONS.HOLIDAYS.PAGINATED_LIST,
        resource: PERMISSION_RESOURCES.HOLIDAYS,
        action: PERMISSION_ACTIONS.PAGINATED_LIST,
        description: 'Get paginated list of holidays',
      },
    ];

    /**
     * Map to store permission names to their IDs for use in role-permission seeding
     */
    const permissionMap = new Map<string, number>();

    /**
     * Process each permission:
     * - Check if permission already exists (by name field)
     * - Create new permission if it doesn't exist
     * - Log the operation result
     * - Store permission ID in map for later use
     */
    for (const permission of permissions) {
      const existing_permission = await this.entityManager.findOne(
        PermissionEntity,
        {
          where: { name: permission.name },
          withDeleted: true,
        },
      );

      if (!existing_permission) {
        const permission_entity = this.entityManager.create(PermissionEntity, {
          name: permission.name,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
          created_by: 'auto generated',
          created_at: getPHDateTime(),
        });

        const saved_permission =
          await this.entityManager.save(permission_entity);
        permissionMap.set(permission.name, saved_permission.id);
        this.logger.log(`Created permission: ${permission.name}`);
      } else {
        permissionMap.set(permission.name, existing_permission.id);
        this.logger.log(`Permission already exists: ${permission.name}`);
      }
    }

    return permissionMap;
  }
}
