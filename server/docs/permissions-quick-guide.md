# Permissions Quick Guide

Quick reference for managing permissions in the RBAC system.

---

## Quick Decision

| Scenario                         | Use        | Method                      |
| -------------------------------- | ---------- | --------------------------- |
| New feature (branches, orders)   | ✅ Seeders | Add to seed files           |
| Custom permission (export_excel) | ✅ API     | POST /api/v1/permissions    |
| User-requested permission        | ✅ API     | POST /api/v1/permissions    |
| Business requirement             | ✅ API     | POST /api/v1/permissions    |
| Standard CRUD operations         | ✅ Seeders | Add to seed files           |
| Runtime/dynamic permission       | ✅ API     | POST /api/v1/permissions    |
| Update existing permission       | ✅ API     | PUT /api/v1/permissions/:id |
| Temporary/testing                | ✅ API     | POST /api/v1/permissions    |

---

## Adding New Feature (Seeders)

### 1. Add Permissions

**File:** `create-default-permissions.seed.ts`

```typescript
// Add to permissions array
{
  name: 'branches:create',
  resource: 'branches',
  action: 'create',
  description: 'Create new branches',
},
// ... 6 more (read, update, archive, restore, combobox, paginated_list)
```

### 2. Add to Roles

**File:** `create-default-role-permissions.seed.ts`

```typescript
Admin: [
  // ... existing ...
  'branches:create',
  'branches:read',
  'branches:update',
  'branches:archive',
  'branches:restore',
  'branches:combobox',
  'branches:paginated_list',
],

Editor: [
  // ... existing ...
  'branches:create',
  'branches:read',
  'branches:update',
  'branches:combobox',
  'branches:paginated_list',
],

Viewer: [
  // ... existing ...
  'branches:read',
  'branches:combobox',
  'branches:paginated_list',
],
```

### 3. Run Seeders

```bash
yarn build
yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts
```

---

## Using API for Custom Permissions

### Create Permission

```http
POST /api/v1/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "orders:export_excel",
  "resource": "orders",
  "action": "export_excel",
  "description": "Export orders to Excel"
}
```

### Update Permission

```http
PUT /api/v1/permissions/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "orders:export_excel",
  "resource": "orders",
  "action": "export_excel",
  "description": "Updated description"
}
```

### Assign to Role

```http
POST /api/v1/roles/:roleId/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission_ids": [45],
  "replace": false
}
```

---

## Standard Permission Set

For new features, include these 7 permissions:

1. `feature:create`
2. `feature:read`
3. `feature:update`
4. `feature:archive`
5. `feature:restore`
6. `feature:combobox`
7. `feature:paginated_list`

---

## Role Permission Patterns

| Role       | Permissions                        |
| ---------- | ---------------------------------- |
| **Admin**  | All 7 permissions                  |
| **Editor** | 5 permissions (no archive/restore) |
| **Viewer** | 3 permissions (read-only)          |

---

## Checklist

### New Feature (Seeders)

- [ ] Add permissions to `create-default-permissions.seed.ts`
- [ ] Add to Admin role (all permissions)
- [ ] Add to Editor role (no archive/restore)
- [ ] Add to Viewer role (read-only)
- [ ] Update documentation comments
- [ ] Run seeders
- [ ] Verify permissions

### Custom Permission (API)

- [ ] Create via API
- [ ] Assign to roles (if needed)
- [ ] Document the permission
- [ ] Note if it's user-requested or business requirement
- [ ] Consider moving to seeders if it becomes standard

---

## Examples

### Example: Branches Feature (Seeders)

```typescript
// 1. Add permissions
{
  name: 'branches:create',
  resource: 'branches',
  action: 'create',
  description: 'Create new branches',
},
// ... 6 more

// 2. Add to roles
Admin: [..., 'branches:create', 'branches:read', ...],
Editor: [..., 'branches:create', 'branches:read', ...],
Viewer: [..., 'branches:read', ...],

// 3. Run seeders
yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts
```

### Example: Custom Export (API)

```http
POST /api/v1/permissions
{
  "name": "orders:export_excel",
  "resource": "orders",
  "action": "export_excel",
  "description": "Export orders to Excel"
}
```

### Example: User-Requested Permission (API)

```http
POST /api/v1/permissions
{
  "name": "reports:custom_dashboard",
  "resource": "reports",
  "action": "custom_dashboard",
  "description": "Access to custom dashboard (requested by Sales team)"
}
```

### Example: Business Requirement (API)

```http
POST /api/v1/permissions
{
  "name": "invoices:approve_override",
  "resource": "invoices",
  "action": "approve_override",
  "description": "Override invoice approval limits (required for new business process)"
}
```

---

## Quick Rule

**Standard feature with CRUD → Seeders**  
**Custom/one-off/user needs/business requirements → API**

**Key Points:**

- Use APIs when users request specific permissions
- Use APIs when business requirements change
- Consider moving API-created permissions to seeders if they become standard

---

For detailed information, see: `server/docs/permissions-management.md`
