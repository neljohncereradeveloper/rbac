import { Module } from '@nestjs/common';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import { RBAC_TOKENS } from './domain/constants';
import {
  RoleRepositoryImpl,
  PermissionRepositoryImpl,
  RolePermissionRepositoryImpl,
  UserRoleRepositoryImpl,
  UserPermissionRepositoryImpl,
} from './infrastructure/database/repositories';
import {
  // Role use cases
  // Note: CreateRoleUseCase, UpdateRoleUseCase, ArchiveRoleUseCase, RestoreRoleUseCase, GetRoleByIdUseCase, GetPaginatedRoleUseCase, ComboboxRoleUseCase removed
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  // Roles are fetched without pagination
  GetAllRolesUseCase,
} from './application/use-cases/role';
import {
  // Permission use cases
  // Note: CreatePermissionUseCase, UpdatePermissionUseCase, ArchivePermissionUseCase, RestorePermissionUseCase, GetPaginatedPermissionUseCase, GetPermissionByIdUseCase, ComboboxPermissionUseCase removed
  // Permissions are statically defined and managed via seeders only
  // Permissions are fetched without pagination
  GetAllPermissionsUseCase,
} from './application/use-cases/permission';
import {
  // Role-Permission use cases
  // Note: AssignPermissionsToRoleUseCase removed - role-permission assignments are managed via seeders only
  GetRolePermissionsUseCase,
} from './application/use-cases/role-permission';
import {
  // User-Role use cases
  AssignRolesToUserUseCase,
  GetUserRolesUseCase,
  // Note: RemoveRolesFromUserUseCase removed - not used in web app (assign with replace=true handles role removal)
} from './application/use-cases/user-role';
import {
  // User-Permission use cases
  DenyPermissionsToUserUseCase,
  GetUserPermissionsUseCase,
  GrantPermissionsToUserUseCase,
  RemovePermissionsFromUserUseCase,
} from './application/use-cases/user-permission';
import { TransactionAdapter } from '@/core/infrastructure/database/adapters/transaction-helper.adapter';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepositoryImpl } from '@/core/infrastructure/database/repositories';
import { RoleController } from './presentation/controllers/role';
import { PermissionController } from './presentation/controllers/permission';
import { RolePermissionController } from './presentation/controllers/role-permission';
import { UserRoleController } from './presentation/controllers/user-role';
import { UserPermissionController } from './presentation/controllers/user-permission';
import { UserRepositoryImpl } from '../user-management/infrastructure/database/repositories';
import { USER_MANAGEMENT_TOKENS } from '../user-management/domain';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [
    RoleController,
    PermissionController,
    RolePermissionController,
    UserRoleController,
    UserPermissionController,
  ],
  providers: [
    // Repository implementations
    {
      provide: RBAC_TOKENS.ROLE,
      useClass: RoleRepositoryImpl,
    },
    {
      provide: RBAC_TOKENS.PERMISSION,
      useClass: PermissionRepositoryImpl,
    },
    {
      provide: RBAC_TOKENS.ROLE_PERMISSION,
      useClass: RolePermissionRepositoryImpl,
    },
    {
      provide: RBAC_TOKENS.USER_ROLE,
      useClass: UserRoleRepositoryImpl,
    },
    {
      provide: RBAC_TOKENS.USER_PERMISSION,
      useClass: UserPermissionRepositoryImpl,
    },
    {
      provide: TOKENS_CORE.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: TOKENS_CORE.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: USER_MANAGEMENT_TOKENS.USER,
      useClass: UserRepositoryImpl,
    },
    // Role use cases
    // Note: CreateRoleUseCase, UpdateRoleUseCase, ArchiveRoleUseCase, RestoreRoleUseCase, GetRoleByIdUseCase, GetPaginatedRoleUseCase, ComboboxRoleUseCase removed
    // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
    // Roles are fetched without pagination
    GetAllRolesUseCase,
    // Permission use cases
    // Note: CreatePermissionUseCase, UpdatePermissionUseCase, ArchivePermissionUseCase, RestorePermissionUseCase, GetPaginatedPermissionUseCase, GetPermissionByIdUseCase, ComboboxPermissionUseCase removed
    // Permissions are statically defined and managed via seeders only
    // Permissions are fetched without pagination
    GetAllPermissionsUseCase,
    // Role-Permission use cases
    // Note: AssignPermissionsToRoleUseCase removed - role-permission assignments are managed via seeders only
    GetRolePermissionsUseCase,
    // User-Role use cases
    AssignRolesToUserUseCase,
    GetUserRolesUseCase,
    // Note: RemoveRolesFromUserUseCase removed - not used in web app (assign with replace=true handles role removal)
    // User-Permission use cases
    DenyPermissionsToUserUseCase,
    GetUserPermissionsUseCase,
    GrantPermissionsToUserUseCase,
    RemovePermissionsFromUserUseCase,
  ],
  exports: [
    // Repository tokens (for use by other modules like AuthModule)
    RBAC_TOKENS.ROLE,
    RBAC_TOKENS.PERMISSION,
    RBAC_TOKENS.ROLE_PERMISSION,
    RBAC_TOKENS.USER_ROLE,
    RBAC_TOKENS.USER_PERMISSION,
    // Role use cases
    // Note: CreateRoleUseCase, UpdateRoleUseCase, ArchiveRoleUseCase, RestoreRoleUseCase, GetRoleByIdUseCase, GetPaginatedRoleUseCase, ComboboxRoleUseCase removed
    // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
    // Roles are fetched without pagination
    GetAllRolesUseCase,
    // Permission use cases
    // Note: CreatePermissionUseCase, UpdatePermissionUseCase, ArchivePermissionUseCase, RestorePermissionUseCase, GetPaginatedPermissionUseCase, GetPermissionByIdUseCase, ComboboxPermissionUseCase removed
    // Permissions are statically defined and managed via seeders only
    // Permissions are fetched without pagination
    GetAllPermissionsUseCase,
    // Role-Permission use cases
    // Note: AssignPermissionsToRoleUseCase removed - role-permission assignments are managed via seeders only
    GetRolePermissionsUseCase,
    // User-Role use cases
    AssignRolesToUserUseCase,
    GetUserRolesUseCase,
    // Note: RemoveRolesFromUserUseCase removed - not used in web app (assign with replace=true handles role removal)
    // User-Permission use cases
    DenyPermissionsToUserUseCase,
    GetUserPermissionsUseCase,
    GrantPermissionsToUserUseCase,
    RemovePermissionsFromUserUseCase,
  ],
})
export class RbacModule { }
