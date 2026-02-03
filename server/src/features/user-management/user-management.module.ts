import { Module } from '@nestjs/common';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import { USER_MANAGEMENT_TOKENS } from './domain/constants';
import { UserRepositoryImpl } from './infrastructure/database/repositories/user.repository.impl';
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  ChangePasswordUseCase,
  VerifyEmailUseCase,
  ArchiveUserUseCase,
  RestoreUserUseCase,
  GetUserByIdUseCase,
  GetPaginatedUserUseCase,
  ComboboxUserUseCase,
} from './application/use-cases/user';
import { TransactionAdapter } from '@/core/infrastructure/database/adapters/transaction-helper.adapter';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepositoryImpl } from '@/core/infrastructure/database/repositories';
import { UserController } from './presentation/controllers';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [UserController],
  providers: [
    // Repository implementation
    {
      provide: USER_MANAGEMENT_TOKENS.USER,
      useClass: UserRepositoryImpl,
    },
    {
      provide: TOKENS_CORE.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: TOKENS_CORE.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    // Use cases
    CreateUserUseCase,
    UpdateUserUseCase,
    ChangePasswordUseCase,
    VerifyEmailUseCase,
    ArchiveUserUseCase,
    RestoreUserUseCase,
    GetUserByIdUseCase,
    GetPaginatedUserUseCase,
    ComboboxUserUseCase,
  ],
  exports: [
    // Export use cases for use in controllers or other modules
    CreateUserUseCase,
    UpdateUserUseCase,
    ChangePasswordUseCase,
    VerifyEmailUseCase,
    ArchiveUserUseCase,
    RestoreUserUseCase,
    GetUserByIdUseCase,
    GetPaginatedUserUseCase,
    ComboboxUserUseCase,
  ],
})
export class UserManagementModule {}
