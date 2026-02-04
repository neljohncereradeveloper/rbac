import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Request } from 'express';
import { RATE_LIMIT_MESSAGE_KEY } from '../decorators/rate-limit.decorator';

/**
 * IP-based Throttler Guard
 * Custom throttler guard that tracks rate limits per IP address
 * Extracts IP from request headers (X-Forwarded-For for proxies) or direct connection
 * Supports custom error messages via @RateLimit({ message: '...' })
 */
@Injectable()
export class IpThrottlerGuard extends ThrottlerGuard {
  /**
   * Get error message - uses custom message from @RateLimit if set
   */
  protected async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    const customMessage = this.reflector.getAllAndOverride<string>(
      RATE_LIMIT_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (customMessage) {
      return customMessage;
    }
    return super.getErrorMessage(context, throttlerLimitDetail);
  }
  /**
   * Extract IP address from request
   * Handles various proxy scenarios and headers
   */
  private extractIpAddress(request: Request): string {
    // Check for IP in X-Forwarded-For header (for proxies/load balancers)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one (original client)
      const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
      return ip;
    }

    // Check for IP in X-Real-IP header (common in nginx)
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Check req.ips (available when trust proxy is enabled)
    if (request.ips && request.ips.length > 0) {
      return request.ips[0];
    }

    // Fallback to req.ip (Express sets this when trust proxy is enabled)
    if (request.ip) {
      return request.ip;
    }

    // Last fallback to socket remote address
    return request.socket?.remoteAddress || 'unknown';
  }

  /**
   * Get the tracker (identifier) for rate limiting from execution context
   * Uses IP address from request
   */
  protected async getTrackerFromContext(context: ExecutionContext): Promise<string> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.extractIpAddress(request);
  }
}
