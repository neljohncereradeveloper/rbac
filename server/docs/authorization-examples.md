# Authorization Examples

Examples of using `@RequireRoles()` and `@RequirePermissions()` decorators with guards.

---

## Basic Setup

### Import Required Components

```typescript
import { Controller, Get, Post, Put, Delete, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  RolesGuard,
  PermissionsGuard,
  RequireRoles,
  RequirePermissions,
  CurrentUser,
} from '@/features/auth';
import { CurrentUser as CurrentUserType } from '@/core/domain/models';
```

---

## Role-Based Authorization

### Single Role

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @RequireRoles('Admin')
  @Get('dashboard')
  async getDashboard() {
    // Only Admin role can access
  }
}
```

### Multiple Roles (OR)

```typescript
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  @RequireRoles('Admin', 'Editor')
  @Get()
  async getReports() {
    // Admin OR Editor can access
  }
}
```

---

## Permission-Based Authorization

### Single Permission

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  @RequirePermissions('users:create')
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // Only users with users:create permission can access
  }
}
```

### Multiple Permissions (OR - Default)

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  @RequirePermissions('users:create', 'users:update')
  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateDto) {
    // Users with users:create OR users:update can access
  }
}
```

### Multiple Permissions (AND)

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  @RequirePermissions('users:create', 'users:read', true)
  @Post('advanced')
  async advancedCreate(@Body() dto: CreateUserDto) {
    // Users must have BOTH users:create AND users:read
  }
}
```

---

## Combining Roles and Permissions

### Role AND Permission

```typescript
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

---

## Controller-Level Authorization

### Apply to All Routes

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('orders:read') // Applied to all routes
export class OrderController {
  @Get()
  async getOrders() {
    // Requires orders:read permission
  }

  @Get(':id')
  async getOrderById(@Param('id') id: number) {
    // Requires orders:read permission
  }

  @RequirePermissions('orders:create') // Override for specific route
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    // Requires orders:create permission (more specific)
  }
}
```

---

## Real-World Examples

### Example 1: User Management

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  @RequirePermissions('users:read')
  @Get()
  async getUsers() {
    // List users
  }

  @RequirePermissions('users:read')
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    // Get user by ID
  }

  @RequirePermissions('users:create')
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // Create user
  }

  @RequirePermissions('users:update')
  @Put(':id')
  async updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    // Update user
  }

  @RequirePermissions('users:archive')
  @Delete(':id')
  async archiveUser(@Param('id') id: number) {
    // Archive user
  }

  @RequirePermissions('users:restore')
  @Post(':id/restore')
  async restoreUser(@Param('id') id: number) {
    // Restore user
  }
}
```

### Example 2: Role Management (Admin Only)

```typescript
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class RoleController {
  @RequireRoles('Admin')
  @RequirePermissions('roles:read')
  @Get()
  async getRoles() {
    // Only Admin role with roles:read permission
  }

  @RequireRoles('Admin')
  @RequirePermissions('roles:create')
  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    // Only Admin role with roles:create permission
  }

  @RequireRoles('Admin')
  @RequirePermissions('roles:assign_permissions')
  @Post(':id/permissions')
  async assignPermissions(
    @Param('id') id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    // Only Admin role with roles:assign_permissions permission
  }
}
```

### Example 3: Mixed Access Levels

```typescript
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportController {
  // Anyone with read permission
  @RequirePermissions('reports:read')
  @Get()
  async getReports() {
    // Basic reports
  }

  // Requires both read and export permissions
  @RequirePermissions('reports:read', 'reports:export', true)
  @Get('export')
  async exportReports() {
    // Export reports (requires both permissions)
  }

  // Admin only with advanced permission
  @RequireRoles('Admin')
  @RequirePermissions('reports:advanced_analytics')
  @Get('advanced')
  async getAdvancedReports() {
    // Advanced analytics (Admin only)
  }
}
```

---

## Common Patterns

### Pattern 1: Public + Protected Routes

```typescript
@Controller('products')
export class ProductController {
  @Public()
  @Get()
  async getProducts() {
    // Public - no authentication required
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('products:create')
  @Post()
  async createProduct(@Body() dto: CreateProductDto) {
    // Protected - requires authentication and permission
  }
}
```

### Pattern 2: Role-Based Access Control

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @RequireRoles('Admin')
  @Get('settings')
  async getSettings() {
    // Admin only
  }

  @RequireRoles('Admin', 'Editor')
  @Get('content')
  async getContent() {
    // Admin or Editor
  }
}
```

### Pattern 3: Permission-Based Access Control

```typescript
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentController {
  @RequirePermissions('documents:read')
  @Get()
  async getDocuments() {
    // Read permission required
  }

  @RequirePermissions('documents:create')
  @Post()
  async createDocument(@Body() dto: CreateDocumentDto) {
    // Create permission required
  }

  @RequirePermissions('documents:delete')
  @Delete(':id')
  async deleteDocument(@Param('id') id: number) {
    // Delete permission required
  }
}
```

---

## Error Handling

### Unauthorized (401)

Returned when:

- No JWT token provided
- Invalid or expired token
- User not found or archived

### Forbidden (403)

Returned when:

- User doesn't have required role
- User doesn't have required permission

**Example Error Response:**

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: Admin",
  "error": "Forbidden"
}
```

---

## Best Practices

1. **Always use JwtAuthGuard first** - Other guards depend on authenticated user
2. **Use @Public() for public routes** - More explicit than omitting guards
3. **Prefer permissions over roles** - More granular control
4. **Use requireAll flag sparingly** - Usually ANY permission is sufficient
5. **Document permission requirements** - Helps with API documentation
6. **Group related routes** - Use controller-level guards when appropriate
7. **Test authorization** - Ensure guards work correctly with different user roles/permissions

---

## Testing Authorization

### Test User with Roles

```typescript
// User has roles: ['Admin', 'Editor']
// User has permissions: ['users:read', 'users:create', 'users:update']

// ✅ This will pass
@RequireRoles('Admin')
@RequirePermissions('users:read')

// ✅ This will pass
@RequireRoles('Editor')
@RequirePermissions('users:create')

// ❌ This will fail (403)
@RequireRoles('Viewer')
@RequirePermissions('users:delete')
```

---

## Summary

- **@RequireRoles()** - Check user roles (use RolesGuard)
- **@RequirePermissions()** - Check user permissions (use PermissionsGuard)
- **Combine guards** - Use multiple guards for complex authorization
- **Controller-level** - Apply guards/decorators at controller level
- **Public routes** - Use @Public() to bypass authentication
