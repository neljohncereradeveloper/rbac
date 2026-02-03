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
  CreateRoleUseCase,
  GetPaginatedRoleUseCase,
  GetRoleByIdUseCase,
  RestoreRoleUseCase,
  UpdateRoleUseCase,
} from '@/features/rbac/application/use-cases/role';
import { CreateRoleDto, UpdateRoleDto } from '../../dto/role';
import { Role } from '@/features/rbac/domain';
import { CreateRoleCommand, UpdateRoleCommand } from '@/features/rbac/application/commands/role';

@ApiTags('Role')
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
  ) { }

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.ROLES.CREATE)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Put(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.ROLES.UPDATE)
  @ApiOperation({ summary: 'Update role information' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
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

  @Version('1')
  @Delete(':id/archive')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.ARCHIVE)
  @ApiOperation({ summary: 'Archive a role' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Role archived successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.archiveRoleUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.ROLES.RESTORE)
  @ApiOperation({ summary: 'Restore a role' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Role restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.restoreRoleUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Get(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.getRoleByIdUseCase.execute(id);
  }

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get paginated list of roles' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Get('combobox/list')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.READ)
  @ApiOperation({ summary: 'Get roles combobox list' })
  @ApiResponse({
    status: 200,
    description: 'Roles combobox retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxRoleUseCase.execute();
  }
}
