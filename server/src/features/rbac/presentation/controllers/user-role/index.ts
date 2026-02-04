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
// Note: ApiBody still needed for POST endpoint
import { Request } from 'express';
import { createRequestInfo } from '@/core/utils/request-info.util';
import {
  AssignRolesToUserUseCase,
  GetUserRolesUseCase,
  // Note: RemoveRolesFromUserUseCase removed - not used in web app (assign with replace=true handles role removal)
} from '@/features/rbac/application/use-cases/user-role';
import {
  AssignRolesToUserDto,
  // Note: RemoveRolesFromUserDto removed - not used in web app (assign with replace=true handles role removal)
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
  // Note: RemoveRolesFromUserCommand removed - not used in web app (assign with replace=true handles role removal)
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
    // Note: RemoveRolesFromUserUseCase removed - not used in web app (assign with replace=true handles role removal)
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

  // Note: DELETE endpoint removed - not used in web app (assign with replace=true handles role removal)
}
