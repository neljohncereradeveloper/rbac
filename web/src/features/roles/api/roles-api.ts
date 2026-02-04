/**
 * Roles API client - connect to RBAC backend roles endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { PaginatedResult } from "@/lib/api/types"
import type { Role } from "../types/role.types"

export interface FetchRolesParams {
  page?: number
  limit?: number
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
): Promise<PaginatedResult<Role>> {
  const { page = 1, limit = 10, term = "", is_archived = "false", token } =
    params
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    term: term,
    is_archived,
  })
  return apiClient<PaginatedResult<Role>>(`/roles?${searchParams}`, { token })
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
