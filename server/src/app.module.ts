import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import {
  ErrorLoggerMiddleware,
  RequestLoggerMiddleware,
} from '@/core/infrastructure/middlewares';
import { HolidayManagementModule } from './features/holiday-management/holiday-management.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PostgresqlDatabaseModule, HolidayManagementModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, ErrorLoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL }); // Logs all requests
  }
}
