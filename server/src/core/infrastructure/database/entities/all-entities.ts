/**
 * Central export file for all database entities
 * This file aggregates all entities from core and feature modules
 * for use in TypeORM configuration
 */

// Import entity arrays from each feature
import { coreEntities } from './core.entities';
import { userManagementEntities } from '@/features/user-management/infrastructure/database/entities/user-management.entities';
import { rbacEntities } from '@/features/rbac/infrastructure/database/entities/rbac.entities';
import { holidayManagementEntities } from '@/features/holiday-management/infrastructure/database/entities/holiday-management.entities';

// Re-export individual entities for convenience
export * from './activity-log.entity';
export * from '@/features/user-management/infrastructure/database/entities/user.entity';
export * from '@/features/rbac/infrastructure/database/entities/role.entity';
export * from '@/features/rbac/infrastructure/database/entities/permission.entity';
export * from '@/features/rbac/infrastructure/database/entities/role-permission.entity';
export * from '@/features/rbac/infrastructure/database/entities/user-role.entity';
export * from '@/features/rbac/infrastructure/database/entities/user-permission.entity';
export * from '@/features/holiday-management/infrastructure/database/entities/holiday.entity';

/**
 * Array of all entities for TypeORM configuration
 * Combines entities from all features
 * Add new feature entity arrays here when creating new features
 */
export const allEntities = [
  ...coreEntities,
  ...userManagementEntities,
  ...rbacEntities,
  ...holidayManagementEntities,
];
