# RBAC Setup Guide

This guide walks you through setting up the Role-Based Access Control (RBAC) system in your application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Initial Data Seeding](#initial-data-seeding)
4. [Module Configuration](#module-configuration)
5. [API Endpoints](#api-endpoints)
6. [Common Workflows](#common-workflows)
7. [Testing the Setup](#testing-the-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up RBAC, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** database (v12 or higher)
- **Yarn** package manager
- **Environment variables** configured (see `.env` file)

### Required Environment Variables

```env
# Database Configuration
DB_URL=postgresql://username:password@localhost:5432/database_name

# Application Configuration
PORT=3000
NODE_ENV=development

# Optional: Database Logging
DB_LOGGING=false
```

---

## Database Setup

### 1. Run Database Migrations

The RBAC system requires several database tables. Run migrations to create them:

```bash
# Build the project first
yarn build

# Generate migration (if schema changes were made)
yarn migration:generate src/core/infrastructure/database/migrations/files/MigrationName

# Run migrations
yarn migration:run

# Check migration status
yarn migration:show
```

### 2. Database Tables Created

The following tables will be created:

- **`roles`** - Stores role definitions
- **`permissions`** - Stores permission definitions
- **`role_permissions`** - Junction table linking roles to permissions
- **`user_roles`** - Junction table linking users to roles
- **`user_permissions`** - Stores user-specific permission overrides (grant/deny)

### 3. Verify Database Schema

After running migrations, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('roles', 'permissions', 'role_permissions', 'user_roles', 'user_permissions');
```

---

## Initial Data Seeding

### 1. Seed Default Permissions

The system includes seeders for default permissions, roles, and role-permission mappings.

**Default Permissions Created:**

The seed creates permissions for:

- **Roles**: `create`, `read`, `update`, `archive`, `restore`, `assign_permissions`, `remove_permissions`, `combobox`, `paginated_list`
- **Permissions**: `create`, `read`, `update`, `archive`, `restore`, `combobox`, `paginated_list`
- **Users**: `create`, `read`, `update`, `archive`, `restore`, `change_password`, `verify_email`, `combobox`, `paginated_list`

### 2. Seed Default Roles

**Default Roles Created:**

- **Admin** - Full access to all resources
- **Editor** - Can create, read, and update resources (no delete/archive)
- **Viewer** - Read-only access to resources

### 3. Run Seeders

To seed the database with default data:

```bash
# Build the project
yarn build

# Run seeders (executes in order: permissions → roles → role-permissions)
yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts
```

**Note:** Seeders are idempotent - running them multiple times will not create duplicates. They check for existing records by unique fields (name for roles/permissions).

### 4. Verify Seeded Data

After seeding, verify the data:

```sql
-- Check permissions
SELECT COUNT(*) FROM permissions;
-- Expected: ~27 permissions

-- Check roles
SELECT name, description FROM roles;
-- Expected: Admin, Editor, Viewer

-- Check role-permission mappings
SELECT r.name as role, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name;
```

---

## Module Configuration

The RBAC module is already configured in `app.module.ts`. Verify it's imported:

```typescript
import { RbacModule } from './features/rbac/rbac.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PostgresqlDatabaseModule,
    RbacModule, // ✅ RBAC module imported
    // ... other modules
  ],
})
export class AppModule {}
```

### Module Components

The `RbacModule` includes:

- **Controllers:**
  - `RoleController` - `/api/v1/roles`
  - `PermissionController` - `/api/v1/permissions`
  - `RolePermissionController` - `/api/v1/roles/:roleId/permissions`
  - `UserRoleController` - `/api/v1/users/:userId/roles`
  - `UserPermissionController` - `/api/v1/users/:userId/permissions`

- **Use Cases:** All CRUD operations, combobox, pagination, archive/restore
- **Repositories:** Database implementations for all domain repositories
- **Dependencies:** Transaction adapter, Activity log repository

---

## API Endpoints

### Base URL

All RBAC endpoints are prefixed with `/api/v1`

### Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <your-token>
```

### Endpoint Overview

#### Roles

| Method   | Endpoint                      | Description            |
| -------- | ----------------------------- | ---------------------- |
| `POST`   | `/api/v1/roles`               | Create a new role      |
| `GET`    | `/api/v1/roles/:id`           | Get role by ID         |
| `GET`    | `/api/v1/roles`               | Get paginated roles    |
| `GET`    | `/api/v1/roles/combobox/list` | Get roles for dropdown |
| `PUT`    | `/api/v1/roles/:id`           | Update role            |
| `DELETE` | `/api/v1/roles/:id`           | Archive role           |
| `POST`   | `/api/v1/roles/:id/restore`   | Restore archived role  |

#### Permissions

| Method   | Endpoint                            | Description                  |
| -------- | ----------------------------------- | ---------------------------- |
| `POST`   | `/api/v1/permissions`               | Create a new permission      |
| `GET`    | `/api/v1/permissions/:id`           | Get permission by ID         |
| `GET`    | `/api/v1/permissions`               | Get paginated permissions    |
| `GET`    | `/api/v1/permissions/combobox/list` | Get permissions for dropdown |
| `PUT`    | `/api/v1/permissions/:id`           | Update permission            |
| `DELETE` | `/api/v1/permissions/:id`           | Archive permission           |
| `POST`   | `/api/v1/permissions/:id/restore`   | Restore archived permission  |

#### Role-Permissions

| Method   | Endpoint                            | Description                  |
| -------- | ----------------------------------- | ---------------------------- |
| `POST`   | `/api/v1/roles/:roleId/permissions` | Assign permissions to role   |
| `DELETE` | `/api/v1/roles/:roleId/permissions` | Remove permissions from role |

#### User-Roles

| Method   | Endpoint                      | Description            |
| -------- | ----------------------------- | ---------------------- |
| `POST`   | `/api/v1/users/:userId/roles` | Assign roles to user   |
| `DELETE` | `/api/v1/users/:userId/roles` | Remove roles from user |

#### User-Permissions

| Method   | Endpoint                                  | Description                 |
| -------- | ----------------------------------------- | --------------------------- |
| `POST`   | `/api/v1/users/:userId/permissions/grant` | Grant permissions to user   |
| `POST`   | `/api/v1/users/:userId/permissions/deny`  | Deny permissions to user    |
| `DELETE` | `/api/v1/users/:userId/permissions`       | Remove permission overrides |

### API Documentation Files

Complete API examples are available in:

- `server/api/rbac-api.http` - All RBAC endpoints with examples

---

## Common Workflows

### 1. Create a New Role with Permissions

```http
POST /api/v1/roles
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Manager",
  "description": "Manager role with elevated permissions",
  "permission_ids": [1, 2, 3, 4, 5]
}
```

### 2. Assign Permissions to Existing Role

```http
POST /api/v1/roles/1/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission_ids": [6, 7, 8],
  "replace": false
}
```

**Note:** `replace: false` adds permissions to existing ones. `replace: true` replaces all permissions.

### 3. Assign Roles to User

```http
POST /api/v1/users/1/roles
Content-Type: application/json
Authorization: Bearer <token>

{
  "role_ids": [1, 2],
  "replace": false
}
```

### 4. Grant Permission Override to User

```http
POST /api/v1/users/1/permissions/grant
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission_ids": [10],
  "replace": false
}
```

**Use Case:** Grant a specific permission to a user even if their roles don't include it.

### 5. Deny Permission Override to User

```http
POST /api/v1/users/1/permissions/deny
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission_ids": [5],
  "replace": false
}
```

**Use Case:** Explicitly deny a permission to a user even if their roles include it.

### 6. Get User's Effective Permissions

To check what permissions a user has:

1. Get user's roles: Query `user_roles` table for `user_id`
2. Get permissions from roles: Query `role_permissions` for each `role_id`
3. Check user permission overrides: Query `user_permissions` for `user_id`
4. Calculate effective permissions:
   - Start with all permissions from roles
   - Add granted permissions from `user_permissions` (where `type = 'grant'`)
   - Remove denied permissions from `user_permissions` (where `type = 'deny'`)

---

## Testing the Setup

### 1. Start the Application

```bash
# Development mode
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

### 2. Test API Endpoints

Use the provided HTTP files or a REST client:

```bash
# Using the HTTP files in server/api/
# Open server/api/rbac-api.http in VS Code with REST Client extension
```

### 3. Verify Endpoints

Test basic operations:

```bash
# 1. Get roles combobox
curl -X GET http://localhost:3000/api/v1/roles/combobox/list \
  -H "Authorization: Bearer <token>"

# 2. Get permissions combobox
curl -X GET http://localhost:3000/api/v1/permissions/combobox/list \
  -H "Authorization: Bearer <token>"

# 3. Get paginated roles
curl -X GET "http://localhost:3000/api/v1/roles?page=1&limit=10&is_archived=false" \
  -H "Authorization: Bearer <token>"
```

### 4. Test Complete Workflow

1. **Create a permission:**

   ```http
   POST /api/v1/permissions
   {
     "name": "orders:create",
     "resource": "orders",
     "action": "create",
     "description": "Create new orders"
   }
   ```

2. **Create a role with permissions:**

   ```http
   POST /api/v1/roles
   {
     "name": "Order Manager",
     "description": "Manages orders",
     "permission_ids": [<permission_id_from_step_1>]
   }
   ```

3. **Assign role to user:**

   ```http
   POST /api/v1/users/1/roles
   {
     "role_ids": [<role_id_from_step_2>],
     "replace": false
   }
   ```

4. **Verify user has permission:**
   - Query database or implement permission check logic

---

## Troubleshooting

### Issue: Migrations Fail

**Solution:**

- Ensure database connection string is correct in `.env`
- Check PostgreSQL is running
- Verify database exists
- Check for conflicting migrations: `yarn migration:show`

### Issue: Seeders Fail

**Solution:**

- Ensure migrations have run successfully
- Check database connection
- Verify seed files are compiled: `yarn build`
- Check logs for specific errors

### Issue: API Returns 401 Unauthorized

**Solution:**

- Verify token is included in `Authorization` header
- Check token format: `Bearer <token>`
- Ensure token is valid and not expired

### Issue: Permission Check Not Working

**Solution:**

- Verify user has roles assigned: Check `user_roles` table
- Verify roles have permissions: Check `role_permissions` table
- Check for user permission overrides: Check `user_permissions` table
- Ensure permission check logic considers grants and denies

### Issue: Duplicate Key Errors

**Solution:**

- Seeders are idempotent, but if errors occur:
- Check unique constraints: `roles.name`, `permissions.name`
- Verify no manual duplicates exist
- Re-run seeders (they skip existing records)

---

## Next Steps

After setup is complete:

1. **Implement Authorization Guards** - Create guards to check permissions before route execution
2. **Add Permission Decorators** - Create decorators to declare required permissions per endpoint
3. **Set Up User Management** - Ensure user management module is configured
4. **Configure Authentication** - Set up JWT authentication if not already done
5. **Create Custom Roles** - Create roles specific to your application needs
6. **Document Custom Permissions** - Document any custom permissions you add

---

## Additional Resources

- **API Examples:** `server/api/rbac-api.http`
- **Feature Documentation:** `server/docs/rbac.md`
- **Domain Models:** `server/src/features/rbac/domain/models/`
- **Use Cases:** `server/src/features/rbac/application/use-cases/`

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the feature documentation: `server/docs/rbac.md`
3. Check application logs for detailed error messages
4. Verify database state matches expected schema
