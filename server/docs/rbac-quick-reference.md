# RBAC Quick Reference

Quick reference guide for common RBAC operations and endpoints.

---

## Quick Start Checklist

- [ ] Database migrations run (`yarn migration:run`)
- [ ] Seeders executed (`yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts`)
- [ ] Application running (`yarn start:dev`)
- [ ] Authentication token obtained
- [ ] API endpoints tested

---

## API Endpoints Quick Reference

### Roles

```http
# Create Role
POST /api/v1/roles
Body: { "name": "RoleName", "description": "...", "permission_ids": [1,2,3] }

# Get Role by ID
GET /api/v1/roles/:id

# List Roles (Paginated)
GET /api/v1/roles?term=&page=1&limit=10&is_archived=false

# Get Roles Combobox
GET /api/v1/roles/combobox/list

# Update Role
PUT /api/v1/roles/:id
Body: { "name": "...", "description": "..." }

# Archive Role
DELETE /api/v1/roles/:id

# Restore Role
POST /api/v1/roles/:id/restore
```

### Permissions

```http
# Create Permission
POST /api/v1/permissions
Body: { "name": "resource:action", "resource": "...", "action": "...", "description": "..." }

# Get Permission by ID
GET /api/v1/permissions/:id

# List Permissions (Paginated)
GET /api/v1/permissions?term=&page=1&limit=10&is_archived=false

# Get Permissions Combobox
GET /api/v1/permissions/combobox/list

# Update Permission
PUT /api/v1/permissions/:id
Body: { "name": "...", "resource": "...", "action": "...", "description": "..." }

# Archive Permission
DELETE /api/v1/permissions/:id

# Restore Permission
POST /api/v1/permissions/:id/restore
```

### Role-Permissions

```http
# Assign Permissions to Role
POST /api/v1/roles/:roleId/permissions
Body: { "permission_ids": [1,2,3], "replace": false }

# Remove Permissions from Role
DELETE /api/v1/roles/:roleId/permissions
Body: { "permission_ids": [1,2] }
```

### User-Roles

```http
# Assign Roles to User
POST /api/v1/users/:userId/roles
Body: { "role_ids": [1,2], "replace": false }

# Remove Roles from User
DELETE /api/v1/users/:userId/roles
Body: { "role_ids": [1] }
```

### User-Permissions

```http
# Grant Permissions to User
POST /api/v1/users/:userId/permissions/grant
Body: { "permission_ids": [1,2,3], "replace": false }

# Deny Permissions to User
POST /api/v1/users/:userId/permissions/deny
Body: { "permission_ids": [1,2], "replace": false }

# Remove Permission Overrides
DELETE /api/v1/users/:userId/permissions
Body: { "permission_ids": [1,2] }
```

---

## Common Patterns

### Permission Naming Convention

```
Format: resource:action

Examples:
- users:create
- users:read
- users:update
- users:archive
- roles:assign_permissions
- orders:cancel
```

### Replace Flag Behavior

| `replace` Value | Behavior                  |
| --------------- | ------------------------- |
| `false`         | Add to existing (default) |
| `true`          | Replace all existing      |

**Example:**

- Role has permissions: [1, 2, 3]
- Assign with `replace: false` and `permission_ids: [4, 5]`
- Result: [1, 2, 3, 4, 5]

- Assign with `replace: true` and `permission_ids: [4, 5]`
- Result: [4, 5]

---

## Default Data

### Default Roles

| Role Name | Description                              |
| --------- | ---------------------------------------- |
| Admin     | Full access to all resources             |
| Editor    | Create, read, update (no delete/archive) |
| Viewer    | Read-only access                         |

### Default Permissions (Sample)

**Roles Resource:**

- `roles:create`
- `roles:read`
- `roles:update`
- `roles:archive`
- `roles:restore`
- `roles:assign_permissions`
- `roles:remove_permissions`
- `roles:combobox`
- `roles:paginated_list`

**Permissions Resource:**

- `permissions:create`
- `permissions:read`
- `permissions:update`
- `permissions:archive`
- `permissions:restore`
- `permissions:combobox`
- `permissions:paginated_list`

**Users Resource:**

- `users:create`
- `users:read`
- `users:update`
- `users:archive`
- `users:restore`
- `users:change_password`
- `users:verify_email`
- `users:combobox`
- `users:paginated_list`

---

## Database Queries

### Check User's Roles

```sql
SELECT r.id, r.name, r.description
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = 1
AND r.deleted_at IS NULL;
```

### Check Role's Permissions

```sql
SELECT p.id, p.name, p.resource, p.action
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = 1
AND p.deleted_at IS NULL;
```

### Check User's Effective Permissions

```sql
-- Get permissions from roles
SELECT DISTINCT p.id, p.name, p.resource, p.action
FROM user_roles ur
JOIN role_permissions rp ON ur.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.user_id = 1
AND p.deleted_at IS NULL

UNION

-- Add granted permissions
SELECT p.id, p.name, p.resource, p.action
FROM user_permissions up
JOIN permissions p ON up.permission_id = p.id
WHERE up.user_id = 1
AND up.type = 'grant'
AND p.deleted_at IS NULL

EXCEPT

-- Remove denied permissions
SELECT p.id, p.name, p.resource, p.action
FROM user_permissions up
JOIN permissions p ON up.permission_id = p.id
WHERE up.user_id = 1
AND up.type = 'deny';
```

### Check if User Has Permission

```sql
-- Replace :permission_name with actual permission (e.g., 'users:create')
SELECT EXISTS(
  SELECT 1
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = 1
  AND p.name = :permission_name
  AND p.deleted_at IS NULL

  UNION

  SELECT 1
  FROM user_permissions up
  JOIN permissions p ON up.permission_id = p.id
  WHERE up.user_id = 1
  AND up.type = 'grant'
  AND p.name = :permission_name

  EXCEPT

  SELECT 1
  FROM user_permissions up
  JOIN permissions p ON up.permission_id = p.id
  WHERE up.user_id = 1
  AND up.type = 'deny'
  AND p.name = :permission_name
);
```

---

## Workflow Examples

### Create Custom Role with Permissions

```bash
# 1. Create permission
POST /api/v1/permissions
{
  "name": "reports:generate",
  "resource": "reports",
  "action": "generate",
  "description": "Generate reports"
}

# 2. Create role with permission
POST /api/v1/roles
{
  "name": "Report Manager",
  "description": "Can generate and view reports",
  "permission_ids": [<permission_id_from_step_1>]
}

# 3. Assign role to user
POST /api/v1/users/1/roles
{
  "role_ids": [<role_id_from_step_2>],
  "replace": false
}
```

### Update Role Permissions

```bash
# Add more permissions to existing role
POST /api/v1/roles/1/permissions
{
  "permission_ids": [5, 6, 7],
  "replace": false
}

# Replace all permissions
POST /api/v1/roles/1/permissions
{
  "permission_ids": [8, 9, 10],
  "replace": true
}
```

### Grant Temporary Permission Override

```bash
# Grant specific permission to user (even if role doesn't have it)
POST /api/v1/users/1/permissions/grant
{
  "permission_ids": [15],
  "replace": false
}

# Later, remove the override
DELETE /api/v1/users/1/permissions
{
  "permission_ids": [15]
}
```

---

## Error Codes

| HTTP Status | Meaning               | Common Causes                       |
| ----------- | --------------------- | ----------------------------------- |
| 200         | Success               | -                                   |
| 201         | Created               | Resource created successfully       |
| 400         | Bad Request           | Validation error, invalid data      |
| 401         | Unauthorized          | Missing or invalid token            |
| 403         | Forbidden             | Insufficient permissions            |
| 404         | Not Found             | Resource doesn't exist              |
| 409         | Conflict              | Resource already exists or archived |
| 500         | Internal Server Error | Server error, check logs            |

---

## Useful Commands

```bash
# Database Migrations
yarn migration:run          # Run pending migrations
yarn migration:show         # Show migration status
yarn migration:revert        # Revert last migration

# Seeding
yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts

# Development
yarn start:dev              # Start in watch mode
yarn build                  # Build project
yarn lint                   # Run linter
```

---

## File Locations

| Component    | Location                                                    |
| ------------ | ----------------------------------------------------------- |
| RBAC Module  | `server/src/features/rbac/`                                 |
| API Examples | `server/api/rbac-api.http`                                  |
| Setup Guide  | `server/docs/rbac-setup.md`                                 |
| Feature Docs | `server/docs/rbac.md`                                       |
| Seeders      | `server/src/core/infrastructure/database/seed/`             |
| Migrations   | `server/src/core/infrastructure/database/migrations/files/` |

---

## Tips

1. **Always use transactions** - RBAC operations are wrapped in transactions automatically
2. **Check archived state** - Archived roles/permissions are excluded from queries by default
3. **Use combobox endpoints** - For dropdowns and select components
4. **Permission overrides** - Use sparingly; prefer role-based permissions
5. **Idempotent operations** - Most operations can be safely retried
6. **Audit trail** - All operations are logged in `activity_logs` table

---

For detailed setup instructions, see: `server/docs/rbac-setup.md`
