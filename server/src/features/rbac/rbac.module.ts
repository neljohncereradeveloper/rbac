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
  CreateRoleUseCase,
  UpdateRoleUseCase,
  ArchiveRoleUseCase,
  RestoreRoleUseCase,
  GetRoleByIdUseCase,
  GetPaginatedRoleUseCase,
  ComboboxRoleUseCase,
  // Permission use cases
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
  ArchivePermissionUseCase,
  RestorePermissionUseCase,
  GetPermissionByIdUseCase,
  GetPaginatedPermissionUseCase,
  ComboboxPermissionUseCase,
  // Role-Permission use cases
  AssignPermissionsToRoleUseCase,
  RemovePermissionsFromRoleUseCase,
  // User-Role use cases
  AssignRolesToUserUseCase,
  RemoveRolesFromUserUseCase,
  // User-Permission use cases
  GrantPermissionsToUserUseCase,
  DenyPermissionsToUserUseCase,
  RemovePermissionsFromUserUseCase,
} from './application/use-cases';
import {
  RoleController,
  PermissionController,
  RolePermissionController,
  UserRoleController,
  UserPermissionController,
} from './presentation/controllers';
import { TransactionAdapter } from '@/core/infrastructure/database/adapters/transaction-helper.adapter';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepositoryImpl } from '@/core/infrastructure/database/repositories';

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
    // Role use cases
    CreateRoleUseCase,
    UpdateRoleUseCase,
    ArchiveRoleUseCase,
    RestoreRoleUseCase,
    GetRoleByIdUseCase,
    GetPaginatedRoleUseCase,
    ComboboxRoleUseCase,
    // Permission use cases
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    ArchivePermissionUseCase,
    RestorePermissionUseCase,
    GetPermissionByIdUseCase,
    GetPaginatedPermissionUseCase,
    ComboboxPermissionUseCase,
    // Role-Permission use cases
    AssignPermissionsToRoleUseCase,
    RemovePermissionsFromRoleUseCase,
    // User-Role use cases
    AssignRolesToUserUseCase,
    RemoveRolesFromUserUseCase,
    // User-Permission use cases
    GrantPermissionsToUserUseCase,
    DenyPermissionsToUserUseCase,
    RemovePermissionsFromUserUseCase,
  ],
  exports: [
    // Export repository tokens for use in other modules (e.g., AuthModule)
    RBAC_TOKENS.ROLE,
    RBAC_TOKENS.PERMISSION,
    RBAC_TOKENS.ROLE_PERMISSION,
    RBAC_TOKENS.USER_ROLE,
    RBAC_TOKENS.USER_PERMISSION,
    // Export use cases for use in controllers or other modules
    // Role use cases
    CreateRoleUseCase,
    UpdateRoleUseCase,
    ArchiveRoleUseCase,
    RestoreRoleUseCase,
    GetRoleByIdUseCase,
    GetPaginatedRoleUseCase,
    ComboboxRoleUseCase,
    // Permission use cases
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    ArchivePermissionUseCase,
    RestorePermissionUseCase,
    GetPermissionByIdUseCase,
    GetPaginatedPermissionUseCase,
    ComboboxPermissionUseCase,
    // Role-Permission use cases
    AssignPermissionsToRoleUseCase,
    RemovePermissionsFromRoleUseCase,
    // User-Role use cases
    AssignRolesToUserUseCase,
    RemoveRolesFromUserUseCase,
    // User-Permission use cases
    GrantPermissionsToUserUseCase,
    DenyPermissionsToUserUseCase,
    RemovePermissionsFromUserUseCase,
  ],
})
export class RbacModule { }
