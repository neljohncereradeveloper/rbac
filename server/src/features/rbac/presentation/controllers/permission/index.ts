import {
  Controller,
  Get,
  Param,
  Version,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
  // Note: CreatePermissionUseCase, UpdatePermissionUseCase, ArchivePermissionUseCase, RestorePermissionUseCase removed
  // Permissions are statically defined and managed via seeders only
  ComboboxPermissionUseCase,
  GetAllPermissionsUseCase,
  GetPermissionByIdUseCase,
} from '@/features/rbac/application/use-cases/permission';
import { Permission } from '@/features/rbac/domain';

@ApiTags('Permission')
@Controller('permissions')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
export class PermissionController {
  constructor(
    // Note: CreatePermissionUseCase, UpdatePermissionUseCase, ArchivePermissionUseCase, RestorePermissionUseCase removed
    // Permissions are statically defined and managed via seeders only
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    private readonly getAllPermissionsUseCase: GetAllPermissionsUseCase,
    private readonly comboboxPermissionUseCase: ComboboxPermissionUseCase,
  ) { }

  // Note: Create, Update, Archive, and Restore endpoints removed - permissions are statically defined
  // and managed via seeders only. Modifying or archiving them would break authorization checks.

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
  @RequirePermissions(PERMISSIONS.PERMISSIONS.PAGINATED_LIST)
  @ApiOperation({ summary: 'Get all permissions (no pagination, no filtering)' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getAll(): Promise<Permission[]> {
    return this.getAllPermissionsUseCase.execute();
  }

  @Version('1')
  @Get('combobox/list')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.PERMISSIONS.COMBOBOX)
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
