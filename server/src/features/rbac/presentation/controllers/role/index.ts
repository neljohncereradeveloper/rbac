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
  ApiOkResponse,
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
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieves all roles. This endpoint does NOT support pagination, filtering, or search. Returns all roles in a single response. Roles are system-defined (Admin, Editor, Viewer) and cannot be modified. Note: The permission name contains "paginated_list" for backward compatibility, but pagination is not implemented.',
  })
  @ApiOkResponse({
    description: 'Roles retrieved successfully',
    type: [Role],
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
  @ApiOperation({
    summary: 'Get roles combobox list',
    description: 'Retrieves a simplified list of roles formatted for dropdown/combobox components. Returns only role names as value-label pairs.',
  })
  @ApiOkResponse({
    description: 'Roles combobox retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string', example: 'admin' },
          label: { type: 'string', example: 'Admin' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxRoleUseCase.execute();
  }
}
