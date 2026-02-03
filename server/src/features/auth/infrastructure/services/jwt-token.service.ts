import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenPort } from '@/core/domain/ports';
import { JwtPayload } from '@/core/domain/models';

/**
 * JWT Token Service Implementation
 * Provides JWT token generation and verification functionality
 */
@Injectable()
export class JwtTokenService implements JwtTokenPort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate a JWT token from payload
   */
  sign(payload: JwtPayload): string {
    // JwtService.sign() uses the secret and options from JwtModule configuration
    // So we don't need to pass secret/expiresIn here - they're already configured
    return this.jwtService.sign(payload);
  }

  /**
   * Verify and decode a JWT token
   */
  verify(token: string): JwtPayload {
    const secret = this.configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return this.jwtService.verify<JwtPayload>(token, {
      secret,
    });
  }
}
