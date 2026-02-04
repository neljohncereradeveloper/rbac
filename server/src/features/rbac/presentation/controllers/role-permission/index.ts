import {
  Controller,
  Get,
  Param,
  Version,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  GetRolePermissionsUseCase,
} from '@/features/rbac/application/use-cases/role-permission';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import {
  RateLimit,
  RATE_LIMIT_MODERATE,
} from '@/core/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import { RolePermission } from '@/features/rbac/domain/models';

@ApiTags('Role-Permission')
@Controller('roles/:roleId/permissions')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
export class RolePermissionController {
  constructor(
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
  ) { }

  // Note: POST endpoint for assigning permissions removed - role-permission assignments
  // are managed via seeders only. Only GET endpoint remains for viewing role permissions.
  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get permissions assigned to a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<RolePermission[]> {
    return this.getRolePermissionsUseCase.execute(roleId);
  }
}
