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
import { PaginatedResult } from '@/core/utils/pagination.util';
import { PaginationQueryDto } from '@/core/infrastructure/dto';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import {
  ArchivePermissionUseCase,
  ComboboxPermissionUseCase,
  CreatePermissionCommand,
  CreatePermissionUseCase,
  GetPaginatedPermissionUseCase,
  GetPermissionByIdUseCase,
  RestorePermissionUseCase,
  UpdatePermissionCommand,
  UpdatePermissionUseCase,
} from '@/features/rbac/application';
import { CreatePermissionDto, UpdatePermissionDto } from '../../dto/permission';
import { Permission } from '@/features/rbac/domain';

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
  ) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.CREATE)
  async create(
    @Body() dto: CreatePermissionDto,
    @Req() request: Request,
  ): Promise<Permission> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: CreatePermissionCommand = {
      name: dto.name,
      resource: dto.resource,
      action: dto.action,
      description: dto.description ?? null,
    };
    return this.createPermissionUseCase.execute(command, requestInfo);
  }

  @Put(':id')
  @Version('1')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.UPDATE)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdatePermissionDto,
    @Req() request: Request,
  ): Promise<Permission | null> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: UpdatePermissionCommand = {
      name: dto.name,
      resource: dto.resource,
      action: dto.action,
      description: dto.description ?? null,
    };
    return this.updatePermissionUseCase.execute(id, command, requestInfo);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.ARCHIVE)
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
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.RESTORE)
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
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.READ)
  async getById(@Param('id') id: number): Promise<Permission> {
    return this.getPermissionByIdUseCase.execute(id);
  }

  @Get()
  @Version('1')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.READ)
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
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.READ)
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxPermissionUseCase.execute();
  }
}
