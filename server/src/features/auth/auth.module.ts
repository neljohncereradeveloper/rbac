import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import { JwtStrategy } from './infrastructure/strategies';
import { JwtTokenService, RbacService } from './infrastructure/services';
import { AuthController } from './presentation/controllers';
import { TOKENS_CORE } from '@/core/domain/constants';
import { AUTH_TOKENS } from './domain/constants';
import { RbacModule } from '@/features/rbac/rbac.module';
import { ActivityLogRepositoryImpl } from '@/core/infrastructure/database/repositories';
import { TransactionAdapter } from '@/core/infrastructure/database/adapters/transaction-helper.adapter';
import { UserRepositoryImpl } from '../user-management/infrastructure/database/repositories';
import { USER_MANAGEMENT_TOKENS } from '../user-management/domain';
import { LoginUseCase } from './application/use-cases/login';

/**
 * Authentication Module
 * Provides JWT authentication and RBAC authorization functionality
 */
@Module({
  imports: [
    PostgresqlDatabaseModule,
    RbacModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured');
        }
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1d');
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn,
          },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RbacService,
    {
      provide: TOKENS_CORE.JWT,
      useClass: JwtTokenService,
    },
    {
      provide: AUTH_TOKENS.JWT,
      useClass: JwtTokenService,
    },
    {
      provide: AUTH_TOKENS.RBAC,
      useClass: RbacService,
    },
    {
      provide: TOKENS_CORE.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: TOKENS_CORE.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: USER_MANAGEMENT_TOKENS.USER,
      useClass: UserRepositoryImpl,
    },
    JwtTokenService,
  ],
  exports: [LoginUseCase, JwtTokenService, RbacService, AUTH_TOKENS.RBAC],
})
export class AuthModule { }
