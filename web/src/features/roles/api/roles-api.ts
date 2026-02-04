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

export interface CreateRoleParams {
  name: string
  description?: string | null
  permission_ids?: number[]
  token?: string | null
}

export interface UpdateRoleParams {
  name: string
  description?: string | null
  token?: string | null
}

export interface AssignPermissionsToRoleParams {
  permission_ids: number[]
  replace?: boolean
  token?: string | null
}

export interface ComboboxItem {
  value: string
  label: string
}

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

export async function fetchRoleById(
  id: number,
  token?: string | null
): Promise<Role> {
  return apiClient<Role>(`/roles/${id}`, { token })
}

export async function createRole(
  params: CreateRoleParams
): Promise<Role> {
  const { name, description, permission_ids, token } = params
  const body: { name: string; description?: string | null; permission_ids?: number[] } = {
    name,
    description: description ?? null,
  }
  if (permission_ids && permission_ids.length > 0) {
    body.permission_ids = permission_ids
  }
  return apiClient<Role>("/roles", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  })
}

export async function updateRole(
  id: number,
  params: UpdateRoleParams
): Promise<Role | null> {
  const { name, description, token } = params
  return apiClient<Role | null>(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name,
      description: description ?? null,
    }),
    token,
  })
}

export async function archiveRole(
  id: number,
  token?: string | null
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/roles/${id}/archive`, {
    method: "DELETE",
    token,
  })
}

export async function restoreRole(
  id: number,
  token?: string | null
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/roles/${id}/restore`, {
    method: "PATCH",
    token,
  })
}

export async function fetchRolesCombobox(
  token?: string | null
): Promise<ComboboxItem[]> {
  return apiClient<ComboboxItem[]>("/roles/combobox/list", { token })
}

export async function fetchRolePermissions(
  roleId: number,
  token?: string | null
): Promise<RolePermission[]> {
  return apiClient<RolePermission[]>(`/roles/${roleId}/permissions`, { token })
}

export async function assignPermissionsToRole(
  roleId: number,
  params: AssignPermissionsToRoleParams
): Promise<{ success: boolean }> {
  const { permission_ids, replace, token } = params
  const body: { permission_ids: number[]; replace?: boolean } = {
    permission_ids,
  }
  if (replace !== undefined) {
    body.replace = replace
  }
  return apiClient<{ success: boolean }>(
    `/roles/${roleId}/permissions`,
    {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }
  )
}
