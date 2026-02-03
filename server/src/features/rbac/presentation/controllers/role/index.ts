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
  ArchiveRoleUseCase,
  ComboboxRoleUseCase,
  CreateRoleCommand,
  CreateRoleUseCase,
  GetPaginatedRoleUseCase,
  GetRoleByIdUseCase,
  RestoreRoleUseCase,
  UpdateRoleCommand,
  UpdateRoleUseCase,
} from '@/features/rbac/application';
import { CreateRoleDto, UpdateRoleDto } from '../../dto/role';
import { Role } from '@/features/rbac/domain';

@Controller('roles')
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly archiveRoleUseCase: ArchiveRoleUseCase,
    private readonly restoreRoleUseCase: RestoreRoleUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly getPaginatedRoleUseCase: GetPaginatedRoleUseCase,
    private readonly comboboxRoleUseCase: ComboboxRoleUseCase,
  ) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.ROLES.CREATE)
  async create(
    @Body() dto: CreateRoleDto,
    @Req() request: Request,
  ): Promise<Role> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: CreateRoleCommand = {
      name: dto.name,
      description: dto.description ?? null,
      permission_ids: dto.permission_ids,
    };
    return this.createRoleUseCase.execute(command, requestInfo);
  }

  @Put(':id')
  @Version('1')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateRoleDto,
    @Req() request: Request,
  ): Promise<Role | null> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: UpdateRoleCommand = {
      name: dto.name,
      description: dto.description ?? null,
    };
    return this.updateRoleUseCase.execute(id, command, requestInfo);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.ARCHIVE)
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
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.RESTORE)
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
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  async getById(@Param('id') id: number): Promise<Role> {
    return this.getRoleByIdUseCase.execute(id);
  }

  @Get()
  @Version('1')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
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
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxRoleUseCase.execute();
  }
}
