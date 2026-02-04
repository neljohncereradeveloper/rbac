import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Version,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { createRequestInfo } from '@/core/utils/request-info.util';
import {
  AssignPermissionsToRoleUseCase,
  GetRolePermissionsUseCase,
} from '@/features/rbac/application/use-cases/role-permission';
import { AssignPermissionsToRoleDto } from '../../dto/role-permission';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import {
  RateLimit,
  RATE_LIMIT_MODERATE,
} from '@/core/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import { AssignPermissionsToRoleCommand } from '@/features/rbac/application/commands/role-permission';
import { RolePermission } from '@/features/rbac/domain/models';

@ApiTags('Role-Permission')
@Controller('roles/:roleId/permissions')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
export class RolePermissionController {
  constructor(
    private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
    private readonly getRolePermissionsUseCase: GetRolePermissionsUseCase,
  ) { }

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

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.ASSIGN_PERMISSIONS)
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID', example: 1 })
  @ApiBody({ type: AssignPermissionsToRoleDto })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async assignPermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: AssignPermissionsToRoleDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: AssignPermissionsToRoleCommand = {
      role_id: roleId,
      permission_ids: dto.permission_ids,
      replace: dto.replace,
    };
    await this.assignPermissionsToRoleUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
