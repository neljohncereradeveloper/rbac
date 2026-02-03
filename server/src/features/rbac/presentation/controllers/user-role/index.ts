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
import {
    AssignRolesToUserCommand,
    AssignRolesToUserUseCase,
    RemoveRolesFromUserCommand,
    RemoveRolesFromUserUseCase
} from '@/features/rbac/application';
import {
    AssignRolesToUserDto,
    RemoveRolesFromUserDto
} from '@/features/rbac/presentation/dto/user-role';
import { RequirePermissions, RequireRoles } from '@/features/auth';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';


@Controller('users/:userId/roles')
export class UserRoleController {
    constructor(
        private readonly assignRolesToUserUseCase: AssignRolesToUserUseCase,
        private readonly removeRolesFromUserUseCase: RemoveRolesFromUserUseCase,
    ) { }

    @Post()
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @RequireRoles(ROLES.ADMIN)
    @RequirePermissions(PERMISSIONS.USER_ROLES.ASSIGN_ROLES)
    async assignRoles(
        @Param('userId') userId: number,
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

    @Delete()
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @RequireRoles(ROLES.ADMIN)
    @RequirePermissions(PERMISSIONS.USER_ROLES.REMOVE_ROLES)
    async removeRoles(
        @Param('userId') userId: number,
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
