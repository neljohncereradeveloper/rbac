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
    GrantPermissionsToUserCommand,
    DenyPermissionsToUserCommand,
    RemovePermissionsFromUserCommand,
    GrantPermissionsToUserUseCase,
    DenyPermissionsToUserUseCase,
    RemovePermissionsFromUserUseCase,
} from '@/features/rbac/application';
import {
    DenyPermissionsToUserDto,
    GrantPermissionsToUserDto,
    RemovePermissionsFromUserDto
} from '@/features/rbac/presentation/dto/user-permission';

@Controller('users/:userId/permissions')
export class UserPermissionController {
    constructor(
        private readonly grantPermissionsToUserUseCase: GrantPermissionsToUserUseCase,
        private readonly denyPermissionsToUserUseCase: DenyPermissionsToUserUseCase,
        private readonly removePermissionsFromUserUseCase: RemovePermissionsFromUserUseCase,
    ) { }

    @Post('grant')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async grantPermissions(
        @Param('userId') userId: number,
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

    @Post('deny')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async denyPermissions(
        @Param('userId') userId: number,
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

    @Delete()
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async removeOverrides(
        @Param('userId') userId: number,
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
