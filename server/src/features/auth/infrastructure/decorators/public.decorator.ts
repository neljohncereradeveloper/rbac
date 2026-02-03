import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator to mark routes as public (no authentication required)
 * Use this decorator on controllers or route handlers to bypass JWT authentication
 *
 * @example
 * ```ts
 * @Public()
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   // This route is public and doesn't require JWT
 * }
 * ```
 */
export const Public = () => SetMetadata('isPublic', true);
