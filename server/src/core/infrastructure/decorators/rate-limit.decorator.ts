import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IpThrottlerGuard } from '../guards/ip-throttler.guard';

/** Metadata key for custom rate limit error message (used by IpThrottlerGuard) */
export const RATE_LIMIT_MESSAGE_KEY = 'RATE_LIMIT_MESSAGE';

/**
 * Rate limit configuration options
 */
export interface RateLimitOptions {
  /** Max requests allowed within the time window */
  limit: number;
  /** Time window in milliseconds */
  ttl: number;
  /** Custom error message when rate limit is exceeded */
  message?: string;
}

/** Default rate limit: 5 requests per 60 seconds (strict, e.g. for login) */
export const RATE_LIMIT_STRICT: RateLimitOptions = {
  limit: 5,
  ttl: 60000,
};

/** Default rate limit: 20 requests per 60 seconds (moderate) */
export const RATE_LIMIT_MODERATE: RateLimitOptions = {
  limit: 20,
  ttl: 60000,
};

/** Default rate limit: 100 requests per 60 seconds (relaxed) */
export const RATE_LIMIT_RELAXED: RateLimitOptions = {
  limit: 100,
  ttl: 60000,
};

/**
 * Customizable rate limit decorator.
 * Apply to controllers or methods to enable IP-based rate limiting only where needed.
 *
 * @example
 * // Strict limit (e.g. login)
 * @RateLimit({ limit: 5, ttl: 60000 })
 * @Controller('auth')
 * export class AuthController { ... }
 *
 * @example
 * // Use preset
 * @RateLimit(RATE_LIMIT_STRICT)
 * @Post('login')
 * async login() { ... }
 *
 * @example
 * // Different limits per method
 * @Controller('api')
 * export class ApiController {
 *   @RateLimit({ limit: 5, ttl: 60000 })
 *   @Post('sensitive') sensitive() { ... }
 *
 *   @RateLimit({ limit: 100, ttl: 60000 })
 *   @Get('list') list() { ... }
 * }
 *
 * @example
 * // With custom error message
 * @RateLimit({ limit: 5, ttl: 60000, message: 'Too many login attempts. Try again later.' })
 * @Post('login')
 * async login() { ... }
 */
export function RateLimit(options: RateLimitOptions) {
  const decorators = [
    UseGuards(IpThrottlerGuard),
    Throttle({ default: { limit: options.limit, ttl: options.ttl } }),
  ];
  if (options.message) {
    decorators.push(SetMetadata(RATE_LIMIT_MESSAGE_KEY, options.message));
  }
  return applyDecorators(...decorators);
}
