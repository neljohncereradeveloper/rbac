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
import { RequirePermissions, RequireRoles } from '@/features/auth';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import {
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    ArchiveHolidayUseCase,
    RestoreHolidayUseCase,
    GetHolidayByIdUseCase,
    GetPaginatedHolidayUseCase,
    ComboboxHolidayUseCase,
} from '../../application/use-cases/holiday';
import {
    CreateHolidayDto as CreateHolidayPresentationDto,
    UpdateHolidayDto as UpdateHolidayPresentationDto,
} from '../dto/holiday';
import {
    CreateHolidayCommand,
    UpdateHolidayCommand,
} from '../../application/commands/holiday';
import { Holiday } from '../../domain/models';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { PaginationQueryDto } from '@/core/infrastructure/dto';

@Controller('holidays')
export class HolidayController {
    constructor(
        private readonly createHolidayUseCase: CreateHolidayUseCase,
        private readonly updateHolidayUseCase: UpdateHolidayUseCase,
        private readonly archiveHolidayUseCase: ArchiveHolidayUseCase,
        private readonly restoreHolidayUseCase: RestoreHolidayUseCase,
        private readonly getHolidayByIdUseCase: GetHolidayByIdUseCase,
        private readonly getPaginatedHolidayUseCase: GetPaginatedHolidayUseCase,
        private readonly comboboxHolidayUseCase: ComboboxHolidayUseCase,
    ) { }

    @Post()
    @Version('1')
    @HttpCode(HttpStatus.CREATED)
    @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.CREATE)
    async create(
        @Body() presentationDto: CreateHolidayPresentationDto,
        @Req() request: Request,
    ): Promise<Holiday> {
        const requestInfo = createRequestInfo(request);
        // Map presentation DTO to application command
        const command: CreateHolidayCommand = {
            name: presentationDto.name,
            date: presentationDto.date,
            type: presentationDto.type,
            description: presentationDto.description ?? null,
            is_recurring: presentationDto.is_recurring ?? false,
        };
        return this.createHolidayUseCase.execute(command, requestInfo);
    }

    @Put(':id')
    @Version('1')
    @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.UPDATE)
    async update(
        @Param('id') id: number,
        @Body() presentationDto: UpdateHolidayPresentationDto,
        @Req() request: Request,
    ): Promise<Holiday | null> {
        const requestInfo = createRequestInfo(request);
        // Map presentation DTO to application command
        const command: UpdateHolidayCommand = {
            name: presentationDto.name,
            date: presentationDto.date,
            type: presentationDto.type,
            description: presentationDto.description ?? null,
            is_recurring: presentationDto.is_recurring ?? false,
        };
        return this.updateHolidayUseCase.execute(id, command, requestInfo);
    }

    @Delete(':id')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @RequireRoles(ROLES.ADMIN)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.ARCHIVE)
    async archive(
        @Param('id') id: number,
        @Req() request: Request,
    ): Promise<boolean> {
        const requestInfo = createRequestInfo(request);
        await this.archiveHolidayUseCase.execute(id, requestInfo);
        return true;
    }

    @Post(':id/restore')
    @Version('1')
    @HttpCode(HttpStatus.OK)
    @RequireRoles(ROLES.ADMIN)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.RESTORE)
    async restore(
        @Param('id') id: number,
        @Req() request: Request,
    ): Promise<{ success: boolean }> {
        const requestInfo = createRequestInfo(request);
        await this.restoreHolidayUseCase.execute(id, requestInfo);
        return { success: true };
    }

    @Get(':id')
    @Version('1')
    @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.READ)
    async getById(@Param('id') id: number): Promise<Holiday> {
        return this.getHolidayByIdUseCase.execute(id);
    }

    @Get()
    @Version('1')
    @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.READ)
    async getPaginated(
        @Query() query: PaginationQueryDto
    ): Promise<PaginatedResult<Holiday>> {
        return this.getPaginatedHolidayUseCase.execute(
            query.term ?? '',
            query.page,
            query.limit,
            query.is_archived === 'true',
        );
    }

    @Get('combobox')
    @Version('1')
    @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
    @RequirePermissions(PERMISSIONS.HOLIDAYS.READ)
    async getCombobox(): Promise<{ value: string; label: string }[]> {
        return this.comboboxHolidayUseCase.execute();
    }
}
