# RBAC Feature Documentation

This document describes the Role-Based Access Control (RBAC) feature: its design, process flow, and how to set it up and extend it.

---

## Overview

RBAC controls access to resources by assigning **permissions** to **roles**, and roles to users. A user gains access based on the permissions of their assigned roles.

### Concepts

| Concept        | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| **Role**       | A named grouping of permissions (e.g., "Admin", "Editor", "Viewer")                |
| **Permission** | A specific capability on a resource (e.g., `users:create`, `orders:read`)          |
| **Resource**   | The domain entity or area being protected (e.g., `users`, `orders`)                |
| **Action**     | The operation allowed on the resource (e.g., `create`, `read`, `update`, `delete`) |

### Permission Naming

Permissions use `resource` and `action`:

- **Resource**: The target (e.g., `users`, `roles`, `permissions`, `orders`)
- **Action**: The operation (e.g., `create`, `read`, `update`, `delete`, `archive`)
- **Name**: Full identifier (e.g., `users:create`, `orders:read`)

---

## Process Flow

### 1. Define Permissions

Create permissions for each resource and action:

```
Resource: users    → Actions: create, read, update, delete, archive
Resource: roles    → Actions: create, read, update, archive, assign_permissions
Resource: orders   → Actions: create, read, update, cancel
```

### 2. Create Roles (with Permissions)

Create roles and link permissions in one step. When creating a role, pass `permission_ids` to assign permissions immediately:

```
Role: Admin
  - users:create, users:read, users:update, users:delete, users:archive
  - roles:create, roles:read, roles:update, roles:archive, roles:assign_permissions
  - orders:create, orders:read, orders:update, orders:cancel

Role: Editor
  - users:read, users:update
  - orders:create, orders:read, orders:update

Role: Viewer
  - users:read
  - orders:read
```

### 3. Assign Roles to Users

Link users to one or more roles. Access is granted if any of the user’s roles has the required permission.

### 4. Check Access

Before performing an action:

1. Resolve the user’s roles
2. Collect all permissions from those roles
3. Check if the required permission exists in that set

---

## Domain Structure

The RBAC feature follows a feature-based, DDD layout:

```
src/features/rbac/
  domain/
    models/           # Role, Permission, RolePermission, UserRole
    constants/        # ROLE_ACTIONS, PERMISSION_ACTIONS, ROLE_PERMISSION_ACTIONS, USER_ROLE_ACTIONS
    exceptions/      # RoleBusinessException, PermissionBusinessException, RolePermissionBusinessException, UserRoleBusinessException
    repositories/    # RoleRepository, PermissionRepository, RolePermissionRepository, UserRoleRepository
```

### Role Model

| Field         | Type           | Description                          |
| ------------- | -------------- | ------------------------------------ |
| `id`          | number?        | Primary key                          |
| `name`        | string         | Role name (2–255 chars)              |
| `description` | string \| null | Optional description (max 500 chars) |
| `deleted_by`  | string \| null | User who soft-deleted                |
| `deleted_at`  | Date \| null   | Soft-delete timestamp                |
| `created_by`  | string \| null | Creator                              |
| `created_at`  | Date           | Creation time                        |
| `updated_by`  | string \| null | Last updater                         |
| `updated_at`  | Date           | Last update time                     |

**Methods**: `create()`, `update()`, `archive()`, `restore()`, `validate()`

### Permission Model

| Field            | Type           | Description                          |
| ---------------- | -------------- | ------------------------------------ |
| `id`             | number?        | Primary key                          |
| `name`           | string         | Full permission name (max 255 chars) |
| `resource`       | string         | Resource (max 100 chars)             |
| `action`         | string         | Action (max 50 chars)                |
| `description`    | string \| null | Optional description (max 500 chars) |
| _(audit fields)_ |                | Same as Role                         |

**Methods**: `create()`, `update()`, `archive()`, `restore()`, `validate()`

### RolePermission Model

| Field           | Type           | Description   |
| --------------- | -------------- | ------------- |
| `role_id`       | number         | Role ID       |
| `permission_id` | number         | Permission ID |
| `created_by`    | string \| null | Who created   |
| `created_at`    | Date           | Creation time |

**Methods**: `create()`, `createMany()`, `validate()`

### UserRole Model

| Field        | Type           | Description   |
| ------------ | -------------- | ------------- |
| `user_id`    | number         | User ID       |
| `role_id`    | number         | Role ID       |
| `created_by` | string \| null | Who assigned  |
| `created_at` | Date           | Creation time |

**Methods**: `create()`, `createMany()`, `validate()`

---

## Implementation Status

| Layer                    | Status     | Notes                                                             |
| ------------------------ | ---------- | ----------------------------------------------------------------- |
| **Domain**               | ✅ Done    | Models, constants, exceptions, repository interfaces              |
| **Infrastructure**       | ⏳ Pending | Entities, mappers, repository implementations                     |
| **Application**          | ⏳ Pending | Use cases (create role, assign permissions, etc.)                 |
| **Presentation**         | ⏳ Pending | Controllers, DTOs                                                 |
| **Role–Permission link** | ✅ Domain  | RolePermissionRepository, Role.create(role, ctx, permission_ids?) |
| **User–Role link**       | ✅ Domain  | UserRoleRepository, UserRole model                                |

---

## Next Steps to Complete RBAC

### 1. Infrastructure

- Add TypeORM entities for `role` and `permission`
- Add `role_permission` junction table
- Implement `RoleRepository` and `PermissionRepository`
- Add mappers between entities and domain models

### 2. Role–Permission Association

- `RolePermissionRepository` interface is defined (assign, remove, findPermissionIdsByRoleId)
- `RoleRepository.create()` accepts optional `permission_ids` to link permissions on create
- Add infrastructure: `role_permission` junction table and repository implementation

### 3. User–Role Association

- ✅ UserRole model, UserRoleRepository, UserRoleBusinessException defined
- Add infrastructure: `user_role` junction table and repository implementation

### 4. Authorization Middleware/Guard

- Add guard that checks user permissions before route execution
- Use decorator to declare required permission per endpoint

---

## Usage Examples (Domain)

### Creating a Role (with Permissions)

```typescript
import { Role } from '@/features/rbac/domain';

// 1. Create the role domain model
const role = Role.create({
  name: 'Associate Employee',
  description: 'Standard employee with read/create access',
  created_by: 'admin@example.com',
});

// 2. Persist and link permissions in one call
const createdRole = await roleRepository.create(
  role,
  context,
  [1, 2, 3, 4, 5], // permission_ids for users:read, users:update, orders:read, etc.
);
```

To update permissions on an existing role, use `RolePermissionRepository`:

```typescript
// Replace all permissions for a role
await rolePermissionRepository.assignToRole(
  roleId,
  [1, 2, 3, 4],
  context,
  true,
);

// Add more permissions (replace: false keeps existing)
await rolePermissionRepository.assignToRole(roleId, [5, 6], context, false);

// Remove specific permissions
await rolePermissionRepository.removeFromRole(roleId, [3, 4], context);
```

### Assigning Roles to a User

```typescript
import { UserRole } from '@/features/rbac/domain';

// Single assignment
const userRole = UserRole.create({
  user_id: 123,
  role_id: 1,
  created_by: 'admin@example.com',
});
await userRoleRepository.create(userRole, context);

// Bulk assignment (replace existing roles)
await userRoleRepository.assignToUser(userId, [1, 2], context, true);

// Add more roles (keep existing)
await userRoleRepository.assignToUser(userId, [3], context, false);

// Remove specific roles
await userRoleRepository.removeFromUser(userId, [2], context);

// Get user's role IDs for permission check
const roleIds = await userRoleRepository.findRoleIdsByUserId(userId, context);
```

### Creating a Permission

```typescript
import { Permission } from '@/features/rbac/domain';

const permission = Permission.create({
  name: 'users:create',
  resource: 'users',
  action: 'create',
  description: 'Create new users',
  created_by: 'system',
});
```

### Updating and Archiving

```typescript
role.update({ name: 'Super Admin', updated_by: 'admin@example.com' });
role.archive('admin@example.com');
role.restore();
```

---

## Constants Reference

### ROLE_ACTIONS

Used for logging and auditing:

- `CREATE_ROLE`, `CREATE_ROLE_WITH_PERMISSIONS`, `UPDATE_ROLE`, `ARCHIVE_ROLE`, `RESTORE_ROLE`
- `PAGINATED_LIST_ROLE`, `BY_NAME_ROLE`, `COMBOBOX_ROLE`
- `ASSIGN_PERMISSIONS_TO_ROLE`, `REMOVE_PERMISSIONS_FROM_ROLE`

### USER_ROLE_ACTIONS

- `CREATE_USER_ROLE`, `ASSIGN_ROLES_TO_USER`, `REMOVE_ROLES_FROM_USER`
- `FIND_ROLE_IDS_BY_USER_ID`, `FIND_USER_ROLES_BY_USER_ID`, `EXISTS_USER_ROLE`

### PERMISSION_ACTIONS

- `CREATE_PERMISSION`, `UPDATE_PERMISSION`, `ARCHIVE_PERMISSION`, `RESTORE_PERMISSION`
- `PAGINATED_LIST_PERMISSION`, `BY_NAME_PERMISSION`, `BY_RESOURCE_ACTION_PERMISSION`
- `COMBOBOX_PERMISSION`

---

## Exceptions

| Exception                         | When Thrown                                                                 |
| --------------------------------- | --------------------------------------------------------------------------- |
| `RoleBusinessException`           | Role validation fails (empty name, length, archived state)                  |
| `PermissionBusinessException`     | Permission validation fails (empty resource/action, length, archived state) |
| `RolePermissionBusinessException` | RolePermission validation fails (invalid role_id or permission_id)          |
| `UserRoleBusinessException`       | UserRole validation fails (invalid user_id or role_id)                      |

Both extend `DomainException` and use `HTTP_STATUS` for status codes.
