import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * RequireRoles decorator
 * Specifies which roles are required to access a route
 * User must have at least one of the specified roles
 *
 * @param roles Array of role names (e.g., ['Admin', 'Editor'])
 *
 * @example
 * ```ts
 * @RequireRoles('Admin', 'Editor')
 * @Get('users')
 * async getUsers() {
 *   // Only users with Admin or Editor role can access
 * }
 * ```
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);
