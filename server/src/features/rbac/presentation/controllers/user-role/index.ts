import {
  Controller,
  Get,
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
  AssignRolesToUserUseCase,
  GetUserRolesUseCase,
  RemoveRolesFromUserUseCase,
} from '@/features/rbac/application/use-cases/user-role';
import {
  AssignRolesToUserDto,
  RemoveRolesFromUserDto,
} from '@/features/rbac/presentation/dto/user-role';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import {
  RateLimit,
  RATE_LIMIT_MODERATE,
} from '@/core/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import {
  AssignRolesToUserCommand,
  RemoveRolesFromUserCommand,
} from '@/features/rbac/application/commands/user-role';
import { UserRole } from '@/features/rbac/domain/models';

@ApiTags('User-Role')
@Controller('users/:userId/roles')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
export class UserRoleController {
  constructor(
    private readonly assignRolesToUserUseCase: AssignRolesToUserUseCase,
    private readonly getUserRolesUseCase: GetUserRolesUseCase,
    private readonly removeRolesFromUserUseCase: RemoveRolesFromUserUseCase,
  ) { }

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.USER_ROLES.READ)
  @ApiOperation({ summary: 'Get roles assigned to a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getUserRoles(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserRole[]> {
    return this.getUserRolesUseCase.execute(userId);
  }

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USER_ROLES.ASSIGN_ROLES)
  @ApiOperation({ summary: 'Assign roles to a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiBody({ type: AssignRolesToUserDto })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async assignRoles(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignRolesToUserDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: AssignRolesToUserCommand = {
      user_id: userId,
      role_ids: dto.role_ids,
      replace: dto.replace,
    };
    await this.assignRolesToUserUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Delete()
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USER_ROLES.REMOVE_ROLES)
  @ApiOperation({ summary: 'Remove roles from a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 1 })
  @ApiBody({ type: RemoveRolesFromUserDto })
  @ApiResponse({ status: 200, description: 'Roles removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async removeRoles(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: RemoveRolesFromUserDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: RemoveRolesFromUserCommand = {
      user_id: userId,
      role_ids: dto.role_ids,
    };
    await this.removeRolesFromUserUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
