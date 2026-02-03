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
import { AuthModule } from '@/features/auth/auth.module';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RolesGuard,
} from '@/features/auth/infrastructure/guards';
import { HolidayManagementModule } from './features/holiday-management/holiday-management.module';
import { UserManagementModule } from './features/user-management/user-management.module';
import { RbacModule } from './features/rbac/rbac.module';
import { HealthCheckModule } from './features/health-check/health-check.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresqlDatabaseModule,
    AuthModule,
    HealthCheckModule,
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
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
