# Permissions Management Guide

This guide explains how to manage permissions in the RBAC system, covering both **seeders** (for standard features) and **APIs** (for custom/runtime permissions).

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use Seeders](#when-to-use-seeders)
3. [When to Use APIs](#when-to-use-apis)
4. [Adding New Features (Seeders)](#adding-new-features-seeders)
5. [Using APIs for Permissions](#using-apis-for-permissions)
6. [Decision Guide](#decision-guide)
7. [Examples](#examples)

---

## Overview

The RBAC system supports two approaches for managing permissions:

1. **Seeders** - For standard features with predictable CRUD operations (version-controlled, reproducible)
2. **APIs** - For custom, runtime, or environment-specific permissions (flexible, dynamic)

---

## When to Use Seeders

Use **seeders** for:

✅ **Standard Features** - New features with standard CRUD operations (branches, orders, products)  
✅ **Version Control** - Permissions that should be tracked in git  
✅ **Consistency** - Permissions that should be identical across all environments  
✅ **Default Roles** - Assigning permissions to Admin, Editor, Viewer roles  
✅ **Bulk Setup** - Creating multiple permissions at once

**Examples:**

- Adding "branches" feature → Use seeders
- Adding "orders" feature → Use seeders
- Standard operations (create, read, update, archive, restore) → Use seeders

---

## When to Use APIs

Use **APIs** for:

✅ **Custom Permissions** - One-off permissions not part of standard CRUD  
✅ **Runtime Permissions** - Permissions created dynamically at runtime  
✅ **User Needs** - Permissions requested by users or stakeholders  
✅ **Business Requirements** - Permissions needed to meet changing business requirements  
✅ **Environment-Specific** - Permissions only needed in specific environments  
✅ **Temporary Permissions** - Permissions for testing or temporary use  
✅ **Updates** - Modifying existing permissions (seeders don't update)  
✅ **Admin UI** - Permissions created through admin interface

**Examples:**

- Custom export permission (`orders:export_excel`) → Use API
- User-requested permission (`reports:custom_dashboard`) → Use API
- Business requirement (`invoices:approve_override`) → Use API
- Special admin permission (`system:maintenance_mode`) → Use API
- Updating permission description → Use API

---

## Adding New Features (Seeders)

When adding a new feature (e.g., "branches", "orders"), follow these steps:

### Step 1: Add Permissions to `SeedPermissions`

**File:** `server/src/core/infrastructure/database/seed/create-default-permissions.seed.ts`

#### 1a. Update Documentation Comment

Add your feature to the documentation comment:

```typescript
/**
 * USAGE:
 * This seed creates default permissions for common resources and actions:
 * - Roles: create, read, update, archive, restore, assign_permissions, remove_permissions, combobox, paginated_list
 * - Permissions: create, read, update, archive, restore, combobox, paginated_list
 * - Users: create, read, update, archive, restore, change_password, verify_email, combobox, paginated_list
 * - Holidays: create, read, update, archive, restore, combobox, paginated_list
 * - Branches: create, read, update, archive, restore, combobox, paginated_list  // ← ADD YOUR FEATURE
 */
```

#### 1b. Add Permissions to Array

Add your feature's permissions before the closing `];`:

```typescript
const permissions = [
  // ... existing permissions ...

  // Branch permissions (example)
  {
    name: 'branches:create',
    resource: 'branches',
    action: 'create',
    description: 'Create new branches',
  },
  {
    name: 'branches:read',
    resource: 'branches',
    action: 'read',
    description: 'View branch details',
  },
  {
    name: 'branches:update',
    resource: 'branches',
    action: 'update',
    description: 'Update branch information',
  },
  {
    name: 'branches:archive',
    resource: 'branches',
    action: 'archive',
    description: 'Archive (soft delete) branches',
  },
  {
    name: 'branches:restore',
    resource: 'branches',
    action: 'restore',
    description: 'Restore archived branches',
  },
  {
    name: 'branches:combobox',
    resource: 'branches',
    action: 'combobox',
    description: 'Get branches list for dropdowns',
  },
  {
    name: 'branches:paginated_list',
    resource: 'branches',
    action: 'paginated_list',
    description: 'Get paginated list of branches',
  },
];
```

### Step 2: Update Role-Permission Mappings

**File:** `server/src/core/infrastructure/database/seed/create-default-role-permissions.seed.ts`

#### 2a. Update Documentation Comment

```typescript
/**
 * USAGE:
 * This seed creates role-permission links:
 * - Admin: All permissions (roles, permissions, users, user_roles, user_permissions, holidays, branches)
 * - Editor: Create, read, update permissions (no archive/restore) for roles, permissions, users, holidays, branches
 * - Viewer: Read-only permissions (read, combobox, paginated_list) for roles, permissions, users, holidays, branches
 */
```

#### 2b. Add to Admin Role (All Permissions)

```typescript
const rolePermissionMappings: Record<string, string[]> = {
  Admin: [
    // ... existing permissions ...

    // All branch permissions
    'branches:create',
    'branches:read',
    'branches:update',
    'branches:archive',
    'branches:restore',
    'branches:combobox',
    'branches:paginated_list',
  ],
  // ...
};
```

#### 2c. Add to Editor Role (No Archive/Restore)

```typescript
Editor: [
  // ... existing permissions ...

  // Branch permissions (no archive/restore)
  'branches:create',
  'branches:read',
  'branches:update',
  'branches:combobox',
  'branches:paginated_list',
],
```

#### 2d. Add to Viewer Role (Read-Only)

```typescript
Viewer: [
  // ... existing permissions ...

  // Read-only branch permissions
  'branches:read',
  'branches:combobox',
  'branches:paginated_list',
],
```

### Step 3: Run Seeders

```bash
# Build the project
yarn build

# Run seeders
yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts
```

### Step 4: Verify

```sql
-- Check permissions created
SELECT name, resource, action
FROM permissions
WHERE resource = 'branches'
ORDER BY action;
-- Expected: 7 permissions

-- Check Admin role has all permissions
SELECT COUNT(*)
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'Admin' AND p.resource = 'branches';
-- Expected: 7
```

---

## Using APIs for Permissions

Use APIs when you need to create custom, runtime, or environment-specific permissions.

### Creating a Permission via API

**Endpoint:** `POST /api/v1/permissions`

**Request:**

```http
POST /api/v1/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "orders:export_excel",
  "resource": "orders",
  "action": "export_excel",
  "description": "Export orders to Excel format"
}
```

**Response:**

```json
{
  "id": 45,
  "name": "orders:export_excel",
  "resource": "orders",
  "action": "export_excel",
  "description": "Export orders to Excel format",
  "created_by": "admin@example.com",
  "created_at": "2026-02-03T10:00:00.000Z",
  "updated_at": "2026-02-03T10:00:00.000Z"
}
```

### Updating a Permission via API

**Endpoint:** `PUT /api/v1/permissions/:id`

**Request:**

```http
PUT /api/v1/permissions/45
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "orders:export_excel",
  "resource": "orders",
  "action": "export_excel",
  "description": "Export orders to Excel format (updated description)"
}
```

### Assigning Custom Permission to Role

After creating a custom permission via API, assign it to roles:

**Endpoint:** `POST /api/v1/roles/:roleId/permissions`

**Request:**

```http
POST /api/v1/roles/1/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission_ids": [45],
  "replace": false
}
```

### Common API Use Cases

#### 1. Custom Export Permission

```http
POST /api/v1/permissions
{
  "name": "orders:export_pdf",
  "resource": "orders",
  "action": "export_pdf",
  "description": "Export orders as PDF"
}
```

#### 2. User-Requested Permission

**Scenario:** A user or department requests a specific permission that wasn't part of the original design.

```http
POST /api/v1/permissions
{
  "name": "reports:custom_dashboard",
  "resource": "reports",
  "action": "custom_dashboard",
  "description": "Access to custom dashboard view (requested by Sales team)"
}
```

**Why API:** This permission wasn't anticipated during development, so it's created via API to meet immediate user needs.

#### 3. Business Requirement Permission

**Scenario:** Business requirements change, and a new permission is needed to meet those requirements.

```http
POST /api/v1/permissions
{
  "name": "invoices:approve_override",
  "resource": "invoices",
  "action": "approve_override",
  "description": "Override invoice approval limits (required for new business process)"
}
```

**Why API:** Business requirements evolve, and this permission addresses a new workflow that wasn't part of the initial design.

#### 4. Special Admin Permission

```http
POST /api/v1/permissions
{
  "name": "system:maintenance_mode",
  "resource": "system",
  "action": "maintenance_mode",
  "description": "Enable/disable maintenance mode"
}
```

#### 5. Environment-Specific Permission

```http
POST /api/v1/permissions
{
  "name": "reports:advanced_analytics",
  "resource": "reports",
  "action": "advanced_analytics",
  "description": "Access advanced analytics (production only)"
}
```

#### 6. Temporary Testing Permission

```http
POST /api/v1/permissions
{
  "name": "test:experimental_feature",
  "resource": "test",
  "action": "experimental_feature",
  "description": "Temporary permission for testing"
}
```

---

## Decision Guide

Use this flowchart to decide which approach to use:

```
Is this a new feature with standard CRUD operations?
├─ YES → Use Seeders ✅
│   └─ Add to create-default-permissions.seed.ts
│   └─ Add to create-default-role-permissions.seed.ts
│   └─ Commit to git
│   └─ Run seeders on deployment
│
└─ NO → Is it a custom/one-off permission?
    ├─ YES → Use API ✅
    │   └─ POST /api/v1/permissions
    │   └─ Created at runtime
    │   └─ May be environment-specific
    │
    └─ NO → Is it for user needs or business requirements?
        ├─ YES → Use API ✅
        │   └─ POST /api/v1/permissions
        │   └─ Meets immediate user/business needs
        │   └─ Can be moved to seeders later if it becomes standard
        │
        └─ NO → Is it updating existing permission?
            ├─ YES → Use API ✅
            │   └─ PUT /api/v1/permissions/:id
            │   └─ Seeders won't update existing
            │
            └─ NO → Is it temporary/testing?
                ├─ YES → Use API ✅
                │   └─ Can be deleted later
                │
                └─ NO → Use Seeders ✅
                    └─ Default to seeders for consistency
```

### Quick Reference Table

| Scenario                           | Use     | Example                    |
| ---------------------------------- | ------- | -------------------------- |
| New feature (branches, orders)     | Seeders | Standard CRUD operations   |
| Custom permission (export_excel)   | API     | One-off, not standard      |
| User-requested permission          | API     | Meets immediate user needs |
| Business requirement               | API     | Addresses changing needs   |
| Standard operations (create, read) | Seeders | Consistent across features |
| Runtime permission                 | API     | Created dynamically        |
| Default role assignment            | Seeders | Consistent access          |
| Environment-specific               | API     | Different per environment  |
| Update existing permission         | API     | Seeders don't update       |
| Temporary/testing                  | API     | Can be deleted             |

---

## Examples

### Example 1: Adding "Orders" Feature (Seeders)

**Scenario:** Adding a new "orders" feature with standard CRUD operations.

**Steps:**

1. **Add permissions to seeders:**

   ```typescript
   // In create-default-permissions.seed.ts
   {
     name: 'orders:create',
     resource: 'orders',
     action: 'create',
     description: 'Create new orders',
   },
   // ... 6 more permissions
   ```

2. **Add to role mappings:**

   ```typescript
   // In create-default-role-permissions.seed.ts
   Admin: [..., 'orders:create', 'orders:read', ...],
   Editor: [..., 'orders:create', 'orders:read', ...],
   Viewer: [..., 'orders:read', ...],
   ```

3. **Run seeders:**
   ```bash
   yarn ts-node src/core/infrastructure/database/seed/seed-runner.ts
   ```

**Result:** ✅ All orders permissions created and assigned to roles automatically.

---

### Example 2: Custom Export Permission (API)

**Scenario:** Need a custom permission to export orders to Excel (not standard CRUD).

**Steps:**

1. **Create permission via API:**

   ```http
   POST /api/v1/permissions
   {
     "name": "orders:export_excel",
     "resource": "orders",
     "action": "export_excel",
     "description": "Export orders to Excel"
   }
   ```

2. **Assign to specific role:**
   ```http
   POST /api/v1/roles/2/permissions
   {
     "permission_ids": [45],
     "replace": false
   }
   ```

**Result:** ✅ Custom permission created and assigned only to Editor role.

---

### Example 2b: User-Requested Permission (API)

**Scenario:** Sales team requests access to a custom dashboard view that wasn't part of the original design.

**Steps:**

1. **Create permission via API:**

   ```http
   POST /api/v1/permissions
   {
     "name": "reports:custom_dashboard",
     "resource": "reports",
     "action": "custom_dashboard",
     "description": "Access to custom dashboard view (requested by Sales team)"
   }
   ```

2. **Assign to Sales Manager role:**
   ```http
   POST /api/v1/roles/5/permissions
   {
     "permission_ids": [46],
     "replace": false
   }
   ```

**Result:** ✅ Permission created quickly to meet user needs without waiting for code deployment.

**Note:** If this permission becomes standard across all environments, consider moving it to seeders in the next release.

---

### Example 2c: Business Requirement Permission (API)

**Scenario:** New business process requires managers to override invoice approval limits.

**Steps:**

1. **Create permission via API:**

   ```http
   POST /api/v1/permissions
   {
     "name": "invoices:approve_override",
     "resource": "invoices",
     "action": "approve_override",
     "description": "Override invoice approval limits (required for new business process)"
   }
   ```

2. **Assign to Manager role:**
   ```http
   POST /api/v1/roles/3/permissions
   {
     "permission_ids": [47],
     "replace": false
   }
   ```

**Result:** ✅ Permission created immediately to support new business requirement.

**Note:** This addresses a changing business need that wasn't anticipated during initial development.

---

### Example 3: Updating Permission Description (API)

**Scenario:** Need to update the description of an existing permission.

**Steps:**

1. **Update via API:**
   ```http
   PUT /api/v1/permissions/15
   {
     "name": "orders:create",
     "resource": "orders",
     "action": "create",
     "description": "Create new orders (updated description)"
   }
   ```

**Note:** Seeders won't update existing permissions (they're idempotent), so use API for updates.

**Result:** ✅ Permission description updated.

---

## Permission Naming Convention

Follow this pattern for consistency:

```
Format: <resource>:<action>

Examples:
- branches:create
- branches:read
- branches:update
- orders:export_excel
- system:maintenance_mode
```

**Rules:**

- Use **lowercase** and **snake_case** for multi-word resources/actions
- Resource name should match your feature name (plural)
- Action names should match your controller methods
- Be descriptive and clear

---

## Standard Permission Set

For most features, include these standard permissions:

```typescript
{
  name: 'feature:create',
  resource: 'feature',
  action: 'create',
},
{
  name: 'feature:read',
  resource: 'feature',
  action: 'read',
},
{
  name: 'feature:update',
  resource: 'feature',
  action: 'update',
},
{
  name: 'feature:archive',
  resource: 'feature',
  action: 'archive',
},
{
  name: 'feature:restore',
  resource: 'feature',
  action: 'restore',
},
{
  name: 'feature:combobox',
  resource: 'feature',
  action: 'combobox',
},
{
  name: 'feature:paginated_list',
  resource: 'feature',
  action: 'paginated_list',
},
```

---

## Checklist

### For New Features (Seeders)

- [ ] Update `SeedPermissions` documentation comment
- [ ] Add feature permissions to permissions array
- [ ] Update `SeedRolePermissions` documentation comment
- [ ] Add permissions to Admin role (all permissions)
- [ ] Add permissions to Editor role (no archive/restore)
- [ ] Add permissions to Viewer role (read-only)
- [ ] Run seeders
- [ ] Verify permissions created
- [ ] Verify role-permission mappings
- [ ] Commit changes to git

### For Custom Permissions (API)

- [ ] Create permission via API
- [ ] Verify permission created
- [ ] Assign to appropriate roles (if needed)
- [ ] Document the custom permission
- [ ] Consider if it should be added to seeders (if it becomes standard)

---

## Best Practices

1. **Default to Seeders** - Use seeders for standard features unless there's a specific reason to use API
2. **Version Control** - Keep standard permissions in seeders (version controlled)
3. **Document Custom Permissions** - Document why custom permissions were created via API
4. **User/Business Needs** - Use API for permissions requested by users or required by changing business needs
5. **Review and Migrate** - Periodically review API-created permissions and consider moving to seeders if they become standard
6. **Consistent Naming** - Follow the naming convention consistently
7. **Test After Changes** - Always verify permissions after creating/updating
8. **Track Business Context** - Include business context in permission descriptions (e.g., "requested by Sales team", "required for new process")

---

## Troubleshooting

### Issue: Permission Not Found After Seeding

**Solution:**

- Check permission name matches exactly (case-sensitive)
- Verify seeder ran successfully
- Check database for permission existence

### Issue: Permission Not Assigned to Role

**Solution:**

- Verify role-permission mapping in seeders
- Check role name matches exactly
- Run seeders again (idempotent)

### Issue: API Permission Not Working

**Solution:**

- Verify permission was created successfully
- Check permission is assigned to user's role
- Verify user has the role assigned

---

## Related Documentation

- **RBAC Setup Guide:** `server/docs/rbac-setup.md`
- **RBAC Quick Reference:** `server/docs/rbac-quick-reference.md`
- **Seeder Analysis:** `server/docs/seeder-analysis.md`
- **API Examples:** `server/api/rbac-api.http`

---

## Summary

- **Seeders** = Standard features, version controlled, consistent
- **APIs** = Custom permissions, runtime, flexible, user needs, business requirements

**Quick Rule:**

- **Standard feature with CRUD → Seeders**
- **Custom/one-off/user needs/business requirements → API**

**Key Points:**

- Use seeders for predictable, standard permissions that are part of your application code
- Use APIs for permissions that meet immediate user needs or changing business requirements
- APIs allow you to respond quickly to user requests without code deployment
- Consider migrating API-created permissions to seeders if they become standard across environments
