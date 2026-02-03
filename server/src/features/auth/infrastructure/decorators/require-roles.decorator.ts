import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * RequireRoles decorator
 * Specifies which roles are required to access a route
 * User must have at least one of the specified roles
 *
 * @param roles Array of role names (e.g., ['admin', 'editor'])
 *
 * @example
 * ```ts
 * // User needs at least one of these roles
 * @RequireRoles('admin', 'editor')
 * @Post('users')
 * async createUser() {
 *   // User needs admin OR editor role
 * }
 * ```
 */
export function RequireRoles(...roles: string[]): MethodDecorator {
  return SetMetadata(ROLES_KEY, roles);
}
