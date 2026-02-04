import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
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
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
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
import { RATE_LIMIT_MODERATE, RateLimit } from '@/core/infrastructure/decorators';

@ApiTags('Holiday')
@Controller('holidays')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
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

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.CREATE)
  @ApiOperation({ summary: 'Create a new holiday' })
  @ApiBody({ type: CreateHolidayPresentationDto })
  @ApiResponse({ status: 201, description: 'Holiday created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Put(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.UPDATE)
  @ApiOperation({ summary: 'Update holiday information' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiBody({ type: UpdateHolidayPresentationDto })
  @ApiResponse({ status: 200, description: 'Holiday updated successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
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

  @Version('1')
  @Delete(':id/archive')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.ARCHIVE)
  @ApiOperation({ summary: 'Archive a holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Holiday archived successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.archiveHolidayUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.RESTORE)
  @ApiOperation({ summary: 'Restore a holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Holiday restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.restoreHolidayUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Get(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.READ)
  @ApiOperation({ summary: 'Get holiday by ID' })
  @ApiParam({ name: 'id', description: 'Holiday ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Holiday retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Holiday not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Holiday> {
    return this.getHolidayByIdUseCase.execute(id);
  }

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.READ)
  @ApiOperation({ summary: 'Get paginated list of holidays' })
  @ApiResponse({
    status: 200,
    description: 'Holidays retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getPaginated(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<Holiday>> {
    return this.getPaginatedHolidayUseCase.execute(
      query.term ?? '',
      query.page,
      query.limit,
      query.is_archived === 'true',
    );
  }

  @Version('1')
  @Get('combobox')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.HOLIDAYS.READ)
  @ApiOperation({ summary: 'Get holidays combobox list' })
  @ApiResponse({
    status: 200,
    description: 'Holidays combobox retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxHolidayUseCase.execute();
  }
}
