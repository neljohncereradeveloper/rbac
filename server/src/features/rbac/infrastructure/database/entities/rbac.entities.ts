/**
 * RBAC feature entities
 * Export all entities for this feature
 */

import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';
import { RolePermissionEntity } from './role-permission.entity';
import { UserRoleEntity } from './user-role.entity';
import { UserPermissionEntity } from './user-permission.entity';

/**
 * Array of RBAC entities for TypeORM configuration
 */
export const rbacEntities = [
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  UserRoleEntity,
  UserPermissionEntity,
];
