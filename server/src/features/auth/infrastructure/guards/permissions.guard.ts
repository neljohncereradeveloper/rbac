import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RbacService } from '../services/rbac.service';

/**
 * Permissions Guard
 * Checks if the authenticated user has the required permissions
 * Must be used after JwtAuthGuard to ensure user is authenticated
 *
 * @example
 * ```ts
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('users:create')
 * @Post('users')
 * async createUser() {
 *   // Only users with users:create permission can access
 * }
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const permissionMetadata = this.reflector.getAllAndOverride<{
      permissions: string[];
      requireAll: boolean;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions required, allow access
    if (!permissionMetadata || !permissionMetadata.permissions.length) {
      return true;
    }

    const { permissions: requiredPermissions, requireAll } = permissionMetadata;

    // Get user from request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check permissions based on requireAll flag
    let hasPermission: boolean;
    if (requireAll) {
      // User must have ALL permissions
      hasPermission = await this.rbacService.hasAllPermissions(
        user.id,
        requiredPermissions,
      );
    } else {
      // User must have at least ONE permission
      hasPermission = await this.rbacService.hasPermission(
        user.id,
        requiredPermissions,
      );
    }

    if (!hasPermission) {
      const message = requireAll
        ? `Access denied. Required all permissions: ${requiredPermissions.join(', ')}`
        : `Access denied. Required at least one permission: ${requiredPermissions.join(', ')}`;
      throw new ForbiddenException(message);
    }

    return true;
  }
}
