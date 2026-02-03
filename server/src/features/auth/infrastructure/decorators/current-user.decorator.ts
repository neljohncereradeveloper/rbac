import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current User Decorator
 * Extracts the authenticated user from the request object
 * Use this decorator in controllers to get the current authenticated user
 *
 * @example
 * ```ts
 * @Get('profile')
 * async getProfile(@CurrentUser() user: any) {
 *   return user; // { id, username, email, first_name, last_name }
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
