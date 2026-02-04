import {
  Controller,
  Get,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
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
  // Note: CreateRoleUseCase, UpdateRoleUseCase, ArchiveRoleUseCase, RestoreRoleUseCase, GetRoleByIdUseCase removed
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  ComboboxRoleUseCase,
  GetAllRolesUseCase,
} from '@/features/rbac/application/use-cases/role';
import { Role } from '@/features/rbac/domain';

@ApiTags('Role')
@Controller('roles')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
export class RoleController {
  constructor(
    // Note: CreateRoleUseCase, UpdateRoleUseCase, ArchiveRoleUseCase, RestoreRoleUseCase, GetRoleByIdUseCase removed
    // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
    private readonly getAllRolesUseCase: GetAllRolesUseCase,
    private readonly comboboxRoleUseCase: ComboboxRoleUseCase,
  ) { }

  // Note: Create, Update, Archive, Restore, and GetById endpoints removed - roles are statically defined
  // (Admin, Editor, Viewer) and managed via seeders only. Modifying or archiving them would break
  // authorization checks since role names are hardcoded in controllers.

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.PAGINATED_LIST)
  @ApiOperation({ summary: 'Get all roles (no pagination, no filtering)' })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getAll(): Promise<Role[]> {
    // Note: Returns all roles without any filtering conditions
    // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
    return this.getAllRolesUseCase.execute();
  }

  @Version('1')
  @Get('combobox/list')
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.COMBOBOX)
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
