/**
 * Roles API client - connect to RBAC backend roles endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { Role } from "../types/role.types"

export interface FetchRolesParams {
  term?: string
  is_archived?: "true" | "false"
  token?: string | null
}

// Note: CreateRoleParams, UpdateRoleParams removed - roles are statically defined and managed via seeders only

export interface RolePermission {
  role_id: number
  permission_id: number
  permission_name?: string
  permission_resource?: string
  permission_action?: string
  permission_description?: string | null
}

export async function fetchRoles(
  params: FetchRolesParams = {}
): Promise<Role[]> {
  const { term = "", is_archived = "false", token } = params
  const searchParams = new URLSearchParams({
    term: term,
    is_archived,
  })
  return apiClient<Role[]>(`/roles?${searchParams}`, { token })
}

// Note: fetchRoleById, createRole, updateRole, archiveRole, restoreRole, fetchRolesCombobox removed
// Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only

export async function fetchRolePermissions(
  roleId: number,
  token?: string | null
): Promise<RolePermission[]> {
  return apiClient<RolePermission[]>(`/roles/${roleId}/permissions`, { token })
}

// Note: assignPermissionsToRole removed - role-permission assignments are managed via seeders only
