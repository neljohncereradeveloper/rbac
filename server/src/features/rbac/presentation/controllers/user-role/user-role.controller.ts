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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestInfo, createRequestInfo } from '@/core/utils/request-info.util';
import {
  RolesGuard,
  PermissionsGuard,
  RequireRoles,
  RequirePermissions,
} from '@/features/auth';
import { ROLES, PERMISSIONS } from '@/core/domain/constants';
import {
  AssignRolesToUserUseCase,
  RemoveRolesFromUserUseCase,
} from '../../../application/use-cases';
import {
  AssignRolesToUserDto as AssignRolesToUserPresentationDto,
  RemoveRolesFromUserDto as RemoveRolesFromUserPresentationDto,
} from '../../dto';
import {
  AssignRolesToUserCommand,
  RemoveRolesFromUserCommand,
} from '../../../application/commands';

@Controller('users/:userId/roles')
@UseGuards(RolesGuard, PermissionsGuard)
export class UserRoleController {
  constructor(
    private readonly assignRolesToUserUseCase: AssignRolesToUserUseCase,
    private readonly removeRolesFromUserUseCase: RemoveRolesFromUserUseCase,
  ) { }

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async assignRoles(
    @Param('userId') userId: number,
    @Body() presentationDto: AssignRolesToUserPresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: AssignRolesToUserCommand = {
      user_id: userId,
      role_ids: presentationDto.role_ids,
      replace: presentationDto.replace,
    };
    await this.assignRolesToUserUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Delete()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USER_ROLES.REMOVE_ROLES)
  async removeRoles(
    @Param('userId') userId: number,
    @Body() presentationDto: RemoveRolesFromUserPresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: RemoveRolesFromUserCommand = {
      user_id: userId,
      role_ids: presentationDto.role_ids,
    };
    await this.removeRolesFromUserUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
