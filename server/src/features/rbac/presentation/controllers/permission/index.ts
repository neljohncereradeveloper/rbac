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
import {
  RateLimit,
  RATE_LIMIT_MODERATE,
} from '@/core/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
import {
  ArchivePermissionUseCase,
  ComboboxPermissionUseCase,
  CreatePermissionUseCase,
  GetPaginatedPermissionUseCase,
  GetPermissionByIdUseCase,
  RestorePermissionUseCase,
  UpdatePermissionUseCase,
} from '@/features/rbac/application/use-cases/permission';
import { CreatePermissionDto, UpdatePermissionDto } from '../../dto/permission';
import { Permission } from '@/features/rbac/domain';
import { CreatePermissionCommand, UpdatePermissionCommand } from '@/features/rbac/application/commands/permission';

@ApiTags('Permission')
@Controller('permissions')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
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

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Put(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update permission information' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 1 })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
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

  @Version('1')
  @Delete(':id/archive')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.ARCHIVE)
  @ApiOperation({ summary: 'Archive a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Permission archived successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.archivePermissionUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.RESTORE)
  @ApiOperation({ summary: 'Restore a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Permission restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.restorePermissionUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Get(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.READ)
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Permission> {
    return this.getPermissionByIdUseCase.execute(id);
  }

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.READ)
  @ApiOperation({ summary: 'Get paginated list of permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Get('combobox/list')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.READ)
  @ApiOperation({ summary: 'Get permissions combobox list' })
  @ApiResponse({
    status: 200,
    description: 'Permissions combobox retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxPermissionUseCase.execute();
  }
}
