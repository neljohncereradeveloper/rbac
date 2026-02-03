import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import {
  ErrorLoggerMiddleware,
  RequestLoggerMiddleware,
} from '@/core/infrastructure/middlewares';
import { AuthModule, JwtAuthGuard } from '@/features/auth';
import { HolidayManagementModule } from './features/holiday-management/holiday-management.module';
import { UserManagementModule } from './features/user-management/user-management.module';
import { RbacModule } from './features/rbac/rbac.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresqlDatabaseModule,
    AuthModule,
    HolidayManagementModule,
    UserManagementModule,
    RbacModule,
  ],
  providers: [
    // Set JWT Auth Guard as global (applies to all routes by default)
    // Use @Public() decorator on routes that should be public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware, ErrorLoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL }); // Logs all requests
  }
}
