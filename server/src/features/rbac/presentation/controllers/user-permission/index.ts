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
  GrantPermissionsToUserUseCase,
  DenyPermissionsToUserUseCase,
  RemovePermissionsFromUserUseCase,
} from '@/features/rbac/application/use-cases/user-permission';
import {
  DenyPermissionsToUserDto,
  GrantPermissionsToUserDto,
  RemovePermissionsFromUserDto,
} from '@/features/rbac/presentation/dto/user-permission';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import { DenyPermissionsToUserCommand, GrantPermissionsToUserCommand, RemovePermissionsFromUserCommand } from '@/features/rbac/application/commands/user-permission';

@ApiTags('User-Permission')
@Controller('users/:userId/permissions')
export class UserPermissionController {
  constructor(
    private readonly grantPermissionsToUserUseCase: GrantPermissionsToUserUseCase,
    private readonly denyPermissionsToUserUseCase: DenyPermissionsToUserUseCase,
    private readonly removePermissionsFromUserUseCase: RemovePermissionsFromUserUseCase,
  ) { }

  @Version('1')
  @Post('grant')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USER_PERMISSIONS.GRANT_PERMISSIONS)
  @ApiOperation({ summary: 'Grant permissions to a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiBody({ type: GrantPermissionsToUserDto })
  @ApiResponse({ status: 200, description: 'Permissions granted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async grantPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: GrantPermissionsToUserDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: GrantPermissionsToUserCommand = {
      user_id: userId,
      permission_ids: dto.permission_ids,
      replace: dto.replace,
    };
    await this.grantPermissionsToUserUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Post('deny')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USER_PERMISSIONS.DENY_PERMISSIONS)
  @ApiOperation({ summary: 'Deny permissions to a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiBody({ type: DenyPermissionsToUserDto })
  @ApiResponse({ status: 200, description: 'Permissions denied successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async denyPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: DenyPermissionsToUserDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: DenyPermissionsToUserCommand = {
      user_id: userId,
      permission_ids: dto.permission_ids,
      replace: dto.replace,
    };
    await this.denyPermissionsToUserUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USER_PERMISSIONS.REMOVE_OVERRIDES)
  @ApiOperation({ summary: 'Remove permission overrides from a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiBody({ type: RemovePermissionsFromUserDto })
  @ApiResponse({ status: 200, description: 'Permission overrides removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async removeOverrides(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: RemovePermissionsFromUserDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: RemovePermissionsFromUserCommand = {
      user_id: userId,
      permission_ids: dto.permission_ids,
    };
    await this.removePermissionsFromUserUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
