import {
  Controller,
  Post,
  Delete,
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
  RemovePermissionsFromRoleUseCase,
} from '@/features/rbac/application/use-cases/role-permission';
import {
  AssignPermissionsToRoleDto,
  RemovePermissionsFromRoleDto,
} from '../../dto/role-permission';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import {
  RateLimit,
  RATE_LIMIT_MODERATE,
} from '@/core/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import { AssignPermissionsToRoleCommand, RemovePermissionsFromRoleCommand } from '@/features/rbac/application/commands/role-permission';

@ApiTags('Role-Permission')
@Controller('roles/:roleId/permissions')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
export class RolePermissionController {
  constructor(
    private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
    private readonly removePermissionsFromRoleUseCase: RemovePermissionsFromRoleUseCase,
  ) { }

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

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.REMOVE_PERMISSIONS)
  @ApiOperation({ summary: 'Remove permissions from a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID', example: 1 })
  @ApiBody({ type: RemovePermissionsFromRoleDto })
  @ApiResponse({ status: 200, description: 'Permissions removed successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async removePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: RemovePermissionsFromRoleDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: RemovePermissionsFromRoleCommand = {
      role_id: roleId,
      permission_ids: dto.permission_ids,
    };
    await this.removePermissionsFromRoleUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
