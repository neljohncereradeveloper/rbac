import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * RequirePermissions decorator
 * Specifies which permissions are required to access a route
 * User must have at least one of the specified permissions by default
 *
 * @param permissions Array of permission names (e.g., ['users:create', 'users:read'])
 * @param requireAll If true, user must have ALL permissions (default: false - requires ANY)
 *
 * @example
 * ```ts
 * // User needs at least one of these permissions
 * @RequirePermissions('users:create', 'users:update')
 * @Post('users')
 * async createUser() {
 *   // User needs users:create OR users:update
 * }
 *
 * // User needs ALL of these permissions
 * @RequirePermissions('users:create', 'users:read', true)
 * @Post('users')
 * async createUser() {
 *   // User needs users:create AND users:read
 * }
 * ```
 */
export function RequirePermissions(
  ...permissions: (string | boolean)[]
): MethodDecorator {
  // Check if last argument is boolean (requireAll flag)
  const lastArg = permissions[permissions.length - 1];
  const requireAll = typeof lastArg === 'boolean' ? lastArg : false;
  const permissionNames = requireAll
    ? (permissions.slice(0, -1) as string[])
    : (permissions as string[]);

  return SetMetadata(PERMISSIONS_KEY, {
    permissions: permissionNames,
    requireAll,
  });
}
