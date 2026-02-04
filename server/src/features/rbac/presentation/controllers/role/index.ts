import {
  Controller,
  Get,
  Query,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
  // Note: CreateRoleUseCase, UpdateRoleUseCase, ArchiveRoleUseCase, RestoreRoleUseCase, GetRoleByIdUseCase removed
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  ComboboxRoleUseCase,
  GetPaginatedRoleUseCase,
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
    private readonly getPaginatedRoleUseCase: GetPaginatedRoleUseCase,
    private readonly comboboxRoleUseCase: ComboboxRoleUseCase,
  ) { }

  // Note: Create, Update, Archive, Restore, and GetById endpoints removed - roles are statically defined
  // (Admin, Editor, Viewer) and managed via seeders only. Modifying or archiving them would break
  // authorization checks since role names are hardcoded in controllers.

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER)
  @RequirePermissions(PERMISSIONS.ROLES.PAGINATED_LIST)
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
    // Note: is_archived parameter is kept for API compatibility but roles cannot be archived
    // Always returns active roles only since roles are statically defined
    return this.getPaginatedRoleUseCase.execute(
      query.term ?? '',
      query.page,
      query.limit,
      false, // Always false - roles cannot be archived
    );
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
