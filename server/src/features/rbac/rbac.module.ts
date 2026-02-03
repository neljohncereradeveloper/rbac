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
} from './application/use-cases/role';
import {
  // Permission use cases
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
  ArchivePermissionUseCase,
  RestorePermissionUseCase,
  GetPermissionByIdUseCase,
  GetPaginatedPermissionUseCase,
  ComboboxPermissionUseCase,
} from './application/use-cases/permission';
import {
  // Role-Permission use cases
  AssignPermissionsToRoleUseCase,
  RemovePermissionsFromRoleUseCase,
} from './application/use-cases/role-permission';
import {
  // User-Role use cases
  AssignRolesToUserUseCase,
  RemoveRolesFromUserUseCase,
} from './application/use-cases/user-role';
import {
  // User-Permission use cases
  GrantPermissionsToUserUseCase,
  DenyPermissionsToUserUseCase,
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
    // Repository tokens (for use by other modules like AuthModule)
    RBAC_TOKENS.ROLE,
    RBAC_TOKENS.PERMISSION,
    RBAC_TOKENS.ROLE_PERMISSION,
    RBAC_TOKENS.USER_ROLE,
    RBAC_TOKENS.USER_PERMISSION,
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
