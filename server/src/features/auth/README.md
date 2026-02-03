# Authentication & Authorization

This module provides JWT authentication and RBAC-based authorization for the application.

## Components

### Guards

- **JwtAuthGuard** - Validates JWT tokens and ensures user is authenticated
- **RolesGuard** - Checks if user has required roles
- **PermissionsGuard** - Checks if user has required permissions

### Decorators

- **@Public()** - Marks routes as public (no authentication required)
- **@CurrentUser()** - Extracts authenticated user from request
- **@RequireRoles(...roles)** - Requires user to have at least one of the specified roles
- **@RequirePermissions(...permissions)** - Requires user to have required permissions

### Services

- **JwtTokenService** - Generates and validates JWT tokens
- **RbacService** - Checks user roles and permissions

## Usage Examples

### Basic Authentication

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@/features/auth';
import { CurrentUser as CurrentUserType } from '@/core/domain/models';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return user;
  }
}
```

### Public Route (No Authentication)

```typescript
import { Controller, Post } from '@nestjs/common';
import { Public } from '@/features/auth';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    // This route is public and doesn't require JWT
  }
}
```

### Require Roles

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, RequireRoles } from '@/features/auth';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @RequireRoles('Admin')
  @Get('users')
  async getUsers() {
    // Only users with Admin role can access
  }

  @RequireRoles('Admin', 'Editor')
  @Get('reports')
  async getReports() {
    // Users with Admin OR Editor role can access
  }
}
```

### Require Permissions

```typescript
import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
} from '@/features/auth';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  @RequirePermissions('users:create')
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // Only users with users:create permission can access
  }

  @RequirePermissions('users:create', 'users:update')
  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateDto) {
    // Users with users:create OR users:update can access
  }

  @RequirePermissions('users:create', 'users:read', true)
  @Post('advanced')
  async advancedCreate(@Body() dto: CreateUserDto) {
    // Users must have BOTH users:create AND users:read
  }
}
```

### Combining Roles and Permissions

```typescript
import { Controller, Delete, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  RequireRoles,
  RequirePermissions,
} from '@/features/auth';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RoleController {
  @RequireRoles('Admin')
  @RequirePermissions('roles:archive')
  @Delete(':id')
  async archiveRole(@Param('id') id: number) {
    // User must be Admin AND have roles:archive permission
  }
}
```

### Controller-Level Guards

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
} from '@/features/auth';

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('orders:read') // Applied to all routes in this controller
export class OrderController {
  @Get()
  async getOrders() {
    // Requires orders:read permission
  }

  @RequirePermissions('orders:create') // Override with more specific permission
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    // Requires orders:create permission
  }
}
```

## How It Works

### Authentication Flow

1. User sends request with JWT token in `Authorization: Bearer <token>` header
2. `JwtAuthGuard` validates token and loads user from database
3. User object is attached to `request.user`

### Authorization Flow

1. `RolesGuard` or `PermissionsGuard` reads decorator metadata
2. `RbacService` checks user's roles/permissions:
   - Gets user's roles from `user_roles` table
   - Gets permissions from roles via `role_permissions` table
   - Checks user-specific permission overrides from `user_permissions` table
   - Calculates effective permissions (role permissions + grants - denials)
3. If user has required role/permission, access is granted
4. Otherwise, `ForbiddenException` is thrown

### Permission Calculation

Effective permissions are calculated as:

```
Effective Permissions =
  (Permissions from all user's roles)
  + (Explicitly granted permissions)
  - (Explicitly denied permissions)
```

## Best Practices

1. **Always use JwtAuthGuard first** - Other guards depend on authenticated user
2. **Use @Public() for public routes** - More explicit than omitting guards
3. **Prefer permissions over roles** - More granular control
4. **Use requireAll flag sparingly** - Usually ANY permission is sufficient
5. **Document permission requirements** - Helps with API documentation

## Error Responses

### Unauthorized (401)

- No token provided
- Invalid token
- Token expired
- User not found or archived

### Forbidden (403)

- User doesn't have required role
- User doesn't have required permission
