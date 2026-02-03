/**
 * Role Name Constants
 *
 * Centralized constants for default role names used throughout the application.
 * These roles are seeded in the database and used for authorization checks.
 *
 * This ensures consistency and makes it easier to maintain role name usage
 * across features and controllers.
 */
export const ROLES = {
  /** Administrator role with full access to all resources and permissions */
  ADMIN: 'Admin',
  /** Editor role with create, read, and update access (no delete/archive) */
  EDITOR: 'Editor',
  /** Viewer role with read-only access to resources */
  VIEWER: 'Viewer',
} as const;

/**
 * Type for role names
 */
export type RoleName = (typeof ROLES)[keyof typeof ROLES];
