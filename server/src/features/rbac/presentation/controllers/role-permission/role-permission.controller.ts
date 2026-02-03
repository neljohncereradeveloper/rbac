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
  AssignPermissionsToRoleUseCase,
  RemovePermissionsFromRoleUseCase,
} from '../../../application/use-cases';
import {
  AssignPermissionsToRoleDto as AssignPermissionsToRolePresentationDto,
  RemovePermissionsFromRoleDto as RemovePermissionsFromRolePresentationDto,
} from '../../dto';
import {
  AssignPermissionsToRoleCommand,
  RemovePermissionsFromRoleCommand,
} from '../../../application/commands';

@Controller('roles/:roleId/permissions')
@UseGuards(RolesGuard, PermissionsGuard)
export class RolePermissionController {
  constructor(
    private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
    private readonly removePermissionsFromRoleUseCase: RemovePermissionsFromRoleUseCase,
  ) { }

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.ASSIGN_PERMISSIONS)
  async assignPermissions(
    @Param('roleId') roleId: number,
    @Body() presentationDto: AssignPermissionsToRolePresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: AssignPermissionsToRoleCommand = {
      role_id: roleId,
      permission_ids: presentationDto.permission_ids,
      replace: presentationDto.replace,
    };
    await this.assignPermissionsToRoleUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Delete()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.REMOVE_PERMISSIONS)
  async removePermissions(
    @Param('roleId') roleId: number,
    @Body() presentationDto: RemovePermissionsFromRolePresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: RemovePermissionsFromRoleCommand = {
      role_id: roleId,
      permission_ids: presentationDto.permission_ids,
    };
    await this.removePermissionsFromRoleUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
