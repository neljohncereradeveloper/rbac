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
} from '@nestjs/common';
import { Request } from 'express';
import { createRequestInfo } from '@/core/utils/request-info.util';
import { AssignPermissionsToRoleCommand, AssignPermissionsToRoleUseCase, RemovePermissionsFromRoleCommand, RemovePermissionsFromRoleUseCase } from '@/features/rbac/application';
import { AssignPermissionsToRoleDto, RemovePermissionsFromRoleDto } from '../../dto/role-permission';


@Controller('roles/:roleId/permissions')
export class RolePermissionController {
    constructor(
        private readonly assignPermissionsToRoleUseCase: AssignPermissionsToRoleUseCase,
        private readonly removePermissionsFromRoleUseCase: RemovePermissionsFromRoleUseCase,
    ) { }

    @Post()
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async assignPermissions(
        @Param('roleId') roleId: number,
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

    @Delete()
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async removePermissions(
        @Param('roleId') roleId: number,
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
