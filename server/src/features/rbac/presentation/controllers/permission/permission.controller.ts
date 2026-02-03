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
import { RequestInfo, createRequestInfo } from '@/core/utils/request-info.util';
import {
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
  ArchivePermissionUseCase,
  RestorePermissionUseCase,
  GetPermissionByIdUseCase,
  GetPaginatedPermissionUseCase,
  ComboboxPermissionUseCase,
} from '../../../application/use-cases';
import {
  CreatePermissionDto as CreatePermissionPresentationDto,
  UpdatePermissionDto as UpdatePermissionPresentationDto,
} from '../../dto';
import {
  CreatePermissionCommand,
  UpdatePermissionCommand,
} from '../../../application/commands';
import { Permission } from '../../../domain/models';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { PaginationQueryDto } from '@/core/infrastructure/dto';

@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly updatePermissionUseCase: UpdatePermissionUseCase,
    private readonly archivePermissionUseCase: ArchivePermissionUseCase,
    private readonly restorePermissionUseCase: RestorePermissionUseCase,
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    private readonly getPaginatedPermissionUseCase: GetPaginatedPermissionUseCase,
    private readonly comboboxPermissionUseCase: ComboboxPermissionUseCase,
  ) { }

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() presentationDto: CreatePermissionPresentationDto,
    @Req() request: Request,
  ): Promise<Permission> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: CreatePermissionCommand = {
      name: presentationDto.name,
      resource: presentationDto.resource,
      action: presentationDto.action,
      description: presentationDto.description ?? null,
    };
    return this.createPermissionUseCase.execute(command, requestInfo);
  }

  @Put(':id')
  @Version('1')
  async update(
    @Param('id') id: number,
    @Body() presentationDto: UpdatePermissionPresentationDto,
    @Req() request: Request,
  ): Promise<Permission | null> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: UpdatePermissionCommand = {
      name: presentationDto.name,
      resource: presentationDto.resource,
      action: presentationDto.action,
      description: presentationDto.description ?? null,
    };
    return this.updatePermissionUseCase.execute(id, command, requestInfo);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async archive(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.archivePermissionUseCase.execute(id, requestInfo);
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
    await this.restorePermissionUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Get(':id')
  @Version('1')
  async getById(@Param('id') id: number): Promise<Permission> {
    return this.getPermissionByIdUseCase.execute(id);
  }

  @Get()
  @Version('1')
  async getPaginated(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<Permission>> {
    return this.getPaginatedPermissionUseCase.execute(
      query.term ?? '',
      query.page,
      query.limit,
      query.is_archived === 'true',
    );
  }

  @Get('combobox/list')
  @Version('1')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxPermissionUseCase.execute();
  }
}
