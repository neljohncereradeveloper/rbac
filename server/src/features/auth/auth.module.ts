import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PostgresqlDatabaseModule } from '@/core/infrastructure/database/postgresql-database.module';
import { JwtStrategy } from './infrastructure/strategies';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from './infrastructure/guards';
import { JwtTokenService, RbacService } from './infrastructure/services';
import { AuthController } from './presentation/controllers';
import { LoginUseCase } from './application/use-cases';
import { TOKENS_CORE } from '@/core/domain/constants';
import { AUTH_TOKENS } from './domain/constants';
import { UserManagementModule } from '@/features/user-management/user-management.module';
import { RbacModule } from '@/features/rbac/rbac.module';
import { USER_MANAGEMENT_TOKENS } from '../user-management/domain/constants';
import { UserRepositoryImpl } from '../user-management/infrastructure/database/repositories';
import { RBAC_TOKENS } from '../rbac/domain';
import { PermissionRepositoryImpl, RolePermissionRepositoryImpl, RoleRepositoryImpl, UserPermissionRepositoryImpl, UserRoleRepositoryImpl } from '../rbac/infrastructure/database/repositories';

/**
 * Authentication Module
 * Provides JWT authentication and RBAC authorization functionality
 */
@Module({
  imports: [
    PostgresqlDatabaseModule,
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
            expiresIn: expiresIn as string,
          },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
    UserManagementModule, // Required for UserRepository injection in JwtStrategy
    RbacModule, // Required for RBAC repositories injection in RbacService
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    RbacService,
    LoginUseCase,
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
    // {
    //   provide: USER_MANAGEMENT_TOKENS.USER,
    //   useClass: UserRepositoryImpl,
    // },
    // {
    //   provide: RBAC_TOKENS.USER_ROLE,
    //   useClass: UserRoleRepositoryImpl,
    // },
    // {
    //   provide: RBAC_TOKENS.USER_PERMISSION,
    //   useClass: UserPermissionRepositoryImpl,
    // },
    // {
    //   provide: RBAC_TOKENS.ROLE_PERMISSION,
    //   useClass: RolePermissionRepositoryImpl,
    // },
    // {
    //   provide: RBAC_TOKENS.ROLE,
    //   useClass: RoleRepositoryImpl,
    // },
    // {
    //   provide: RBAC_TOKENS.PERMISSION,
    //   useClass: PermissionRepositoryImpl,
    // },
    JwtTokenService,
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    RbacService,
    LoginUseCase,
    JwtTokenService,
    // TOKENS_CORE.JWT,
    // AUTH_TOKENS.JWT,
    // AUTH_TOKENS.RBAC,
  ],
})
export class AuthModule { }
