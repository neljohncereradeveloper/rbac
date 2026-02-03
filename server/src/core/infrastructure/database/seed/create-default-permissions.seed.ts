import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { PermissionEntity } from '@/features/rbac/infrastructure/database/entities/permission.entity';
import { getPHDateTime } from '@/core/utils/date.util';

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
      {
        name: 'roles:create',
        resource: 'roles',
        action: 'create',
        description: 'Create new roles',
      },
      {
        name: 'roles:read',
        resource: 'roles',
        action: 'read',
        description: 'View role details',
      },
      {
        name: 'roles:update',
        resource: 'roles',
        action: 'update',
        description: 'Update role information',
      },
      {
        name: 'roles:archive',
        resource: 'roles',
        action: 'archive',
        description: 'Archive (soft delete) roles',
      },
      {
        name: 'roles:restore',
        resource: 'roles',
        action: 'restore',
        description: 'Restore archived roles',
      },
      {
        name: 'roles:assign_permissions',
        resource: 'roles',
        action: 'assign_permissions',
        description: 'Assign permissions to roles',
      },
      {
        name: 'roles:remove_permissions',
        resource: 'roles',
        action: 'remove_permissions',
        description: 'Remove permissions from roles',
      },
      {
        name: 'roles:combobox',
        resource: 'roles',
        action: 'combobox',
        description: 'Get roles list for dropdowns',
      },
      {
        name: 'roles:paginated_list',
        resource: 'roles',
        action: 'paginated_list',
        description: 'Get paginated list of roles',
      },
      // Permission permissions
      {
        name: 'permissions:create',
        resource: 'permissions',
        action: 'create',
        description: 'Create new permissions',
      },
      {
        name: 'permissions:read',
        resource: 'permissions',
        action: 'read',
        description: 'View permission details',
      },
      {
        name: 'permissions:update',
        resource: 'permissions',
        action: 'update',
        description: 'Update permission information',
      },
      {
        name: 'permissions:archive',
        resource: 'permissions',
        action: 'archive',
        description: 'Archive (soft delete) permissions',
      },
      {
        name: 'permissions:restore',
        resource: 'permissions',
        action: 'restore',
        description: 'Restore archived permissions',
      },
      {
        name: 'permissions:combobox',
        resource: 'permissions',
        action: 'combobox',
        description: 'Get permissions list for dropdowns',
      },
      {
        name: 'permissions:paginated_list',
        resource: 'permissions',
        action: 'paginated_list',
        description: 'Get paginated list of permissions',
      },
      // User permissions
      {
        name: 'users:create',
        resource: 'users',
        action: 'create',
        description: 'Create new users',
      },
      {
        name: 'users:read',
        resource: 'users',
        action: 'read',
        description: 'View user details',
      },
      {
        name: 'users:update',
        resource: 'users',
        action: 'update',
        description: 'Update user information',
      },
      {
        name: 'users:archive',
        resource: 'users',
        action: 'archive',
        description: 'Archive (soft delete) users',
      },
      {
        name: 'users:restore',
        resource: 'users',
        action: 'restore',
        description: 'Restore archived users',
      },
      {
        name: 'users:change_password',
        resource: 'users',
        action: 'change_password',
        description: 'Change user passwords',
      },
      {
        name: 'users:verify_email',
        resource: 'users',
        action: 'verify_email',
        description: 'Verify user email addresses',
      },
      {
        name: 'users:combobox',
        resource: 'users',
        action: 'combobox',
        description: 'Get users list for dropdowns',
      },
      {
        name: 'users:paginated_list',
        resource: 'users',
        action: 'paginated_list',
        description: 'Get paginated list of users',
      },
      // User-Role permissions
      {
        name: 'user_roles:assign_roles',
        resource: 'user_roles',
        action: 'assign_roles',
        description: 'Assign roles to users',
      },
      {
        name: 'user_roles:remove_roles',
        resource: 'user_roles',
        action: 'remove_roles',
        description: 'Remove roles from users',
      },
      // User-Permission permissions
      {
        name: 'user_permissions:grant_permissions',
        resource: 'user_permissions',
        action: 'grant_permissions',
        description: 'Grant permissions directly to users',
      },
      {
        name: 'user_permissions:deny_permissions',
        resource: 'user_permissions',
        action: 'deny_permissions',
        description: 'Deny permissions directly to users',
      },
      {
        name: 'user_permissions:remove_overrides',
        resource: 'user_permissions',
        action: 'remove_overrides',
        description: 'Remove permission overrides from users',
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

        const saved_permission = await this.entityManager.save(
          permission_entity,
        );
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
