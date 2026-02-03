export * from './auth.module';
export * from './application';
export * from './presentation';
export * from './infrastructure';
export * from './domain';

// Explicitly re-export guards and decorators to ensure they're available
export { RolesGuard } from './infrastructure/guards/roles.guard';
export { PermissionsGuard } from './infrastructure/guards/permissions.guard';
export { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
export { RequireRoles, ROLES_KEY } from './infrastructure/decorators/require-roles.decorator';
export { RequirePermissions, PERMISSIONS_KEY } from './infrastructure/decorators/require-permissions.decorator';
