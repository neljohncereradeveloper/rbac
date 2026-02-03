import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    Version,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { createRequestInfo } from '@/core/utils/request-info.util';
import {
    CreateRoleUseCase,
    UpdateRoleUseCase,
    ArchiveRoleUseCase,
    RestoreRoleUseCase,
    GetRoleByIdUseCase,
    GetPaginatedRoleUseCase,
    ComboboxRoleUseCase,
} from '../../../application/use-cases';
import {
    CreateRoleDto as CreateRolePresentationDto,
    UpdateRoleDto as UpdateRolePresentationDto,
} from '../../dto/role';
import {
    CreateRoleCommand,
    UpdateRoleCommand,
} from '../../../application/commands';
import { Role } from '../../../domain/models';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { PaginationQueryDto } from '@/core/infrastructure/dto';

@Controller('roles')
// @UseGuards(RolesGuard, PermissionsGuard)
export class RoleController {
    constructor(
        private readonly createRoleUseCase: CreateRoleUseCase,
        private readonly updateRoleUseCase: UpdateRoleUseCase,
        private readonly archiveRoleUseCase: ArchiveRoleUseCase,
        private readonly restoreRoleUseCase: RestoreRoleUseCase,
        private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
        private readonly getPaginatedRoleUseCase: GetPaginatedRoleUseCase,
        private readonly comboboxRoleUseCase: ComboboxRoleUseCase,
    ) { }

    @Post()
    @Version('1')
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() presentationDto: CreateRolePresentationDto,
        @Req() request: Request,
    ): Promise<Role> {
        const requestInfo = createRequestInfo(request);
        // Map presentation DTO to application command
        const command: CreateRoleCommand = {
            name: presentationDto.name,
            description: presentationDto.description ?? null,
            permission_ids: presentationDto.permission_ids,
        };
        return this.createRoleUseCase.execute(command, requestInfo);
    }

    @Put(':id')
    @Version('1')
    async update(
        @Param('id') id: number,
        @Body() presentationDto: UpdateRolePresentationDto,
        @Req() request: Request,
    ): Promise<Role | null> {
        const requestInfo = createRequestInfo(request);
        // Map presentation DTO to application command
        const command: UpdateRoleCommand = {
            name: presentationDto.name,
            description: presentationDto.description ?? null,
        };
        return this.updateRoleUseCase.execute(id, command, requestInfo);
    }

    @Delete(':id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async archive(
        @Param('id') id: number,
        @Req() request: Request,
    ): Promise<{ success: boolean }> {
        const requestInfo = createRequestInfo(request);
        await this.archiveRoleUseCase.execute(id, requestInfo);
        return { success: true };
    }

    @Post(':id/restore')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    async restore(
        @Param('id') id: number,
        @Req() request: Request,
    ): Promise<{ success: boolean }> {
        const requestInfo = createRequestInfo(request);
        await this.restoreRoleUseCase.execute(id, requestInfo);
        return { success: true };
    }

    @Get(':id')
    @Version('1')
    async getById(@Param('id') id: number): Promise<Role> {
        return this.getRoleByIdUseCase.execute(id);
    }

    @Get()
    @Version('1')
    async getPaginated(
        @Query() query: PaginationQueryDto,
    ): Promise<PaginatedResult<Role>> {
        return this.getPaginatedRoleUseCase.execute(
            query.term ?? '',
            query.page,
            query.limit,
            query.is_archived === 'true',
        );
    }

    @Get('combobox/list')
    @Version('1')
    async getCombobox(): Promise<{ value: string; label: string }[]> {
        return this.comboboxRoleUseCase.execute();
    }
}
