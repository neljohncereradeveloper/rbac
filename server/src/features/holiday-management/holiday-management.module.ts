import { Module } from '@nestjs/common';
import { HolidayRepositoryImpl } from './infrastructure/database/repositories';
import { HolidayRepository } from './domain/repositories';
import { HOLIDAY_MANAGEMENT_TOKENS } from './domain/constants';
import {
  CreateHolidayUseCase,
  UpdateHolidayUseCase,
  ArchiveHolidayUseCase,
  RestoreHolidayUseCase,
  GetHolidayByIdUseCase,
  GetPaginatedHolidayUseCase,
  ComboboxHolidayUseCase,
} from './application/use-cases';

@Module({
  providers: [
    // Repository implementation
    {
      provide: HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY,
      useClass: HolidayRepositoryImpl,
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
    // Export repository token for use in other modules
    HOLIDAY_MANAGEMENT_TOKENS.HOLIDAY,
    // Export use cases
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    ArchiveHolidayUseCase,
    RestoreHolidayUseCase,
    GetHolidayByIdUseCase,
    GetPaginatedHolidayUseCase,
    ComboboxHolidayUseCase,
  ],
})
export class HolidayManagementModule { }
