import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { JwtPayload } from '@/core/domain/models';
import { UserRepository } from '@/features/user-management/domain/repositories';
import { USER_MANAGEMENT_TOKENS } from '@/features/user-management/domain/constants';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and loads user from database
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_MANAGEMENT_TOKENS.USER)
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload and return user
   * This method is called by Passport after JWT is verified
   */
  async validate(payload: JwtPayload) {
    // Use query runner for database access without transaction
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const manager = queryRunner.manager;

      const user = await this.userRepository.findById(payload.sub, manager);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.deleted_at) {
        throw new UnauthorizedException('User is archived');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Return user object that will be attached to request.user
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
      };
    } finally {
      await queryRunner.release();
    }
  }
}
