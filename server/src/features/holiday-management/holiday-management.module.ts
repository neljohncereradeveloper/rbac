import { Module } from '@nestjs/common';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import { HOLIDAY_MANAGEMENT_TOKENS } from './domain/constants';
import { HolidayRepositoryImpl } from './infrastructure/database/repositories/holiday.repository.impl';
import {
  CreateHolidayUseCase,
  UpdateHolidayUseCase,
  ArchiveHolidayUseCase,
  RestoreHolidayUseCase,
  GetHolidayByIdUseCase,
  GetPaginatedHolidayUseCase,
  ComboboxHolidayUseCase,
} from './application/use-cases/holiday';
import { HolidayController } from './presentation/controllers';
import { TransactionAdapter } from '@/core/infrastructure/database/adapters/transaction-helper.adapter';
import { TOKENS_CORE } from '@/core/domain/constants';
import { ActivityLogRepositoryImpl } from '@/core/infrastructure/database/repositories';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [HolidayController],
  providers: [
    // Repository implementation
    {
      provide: HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY,
      useClass: HolidayRepositoryImpl,
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
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    ArchiveHolidayUseCase,
    RestoreHolidayUseCase,
    GetHolidayByIdUseCase,
    GetPaginatedHolidayUseCase,
    ComboboxHolidayUseCase,
  ],
  exports: [
    // Export use cases for use in controllers or other modules
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    ArchiveHolidayUseCase,
    RestoreHolidayUseCase,
    GetHolidayByIdUseCase,
    GetPaginatedHolidayUseCase,
    ComboboxHolidayUseCase,
  ],
})
export class HolidayManagementModule {}
