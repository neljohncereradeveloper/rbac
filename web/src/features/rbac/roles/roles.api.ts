/**
 * Roles API client - connect to RBAC backend roles endpoints
 */

import { apiClient } from "@/shared/api-client"
import type { Role, RolePermission } from "./roles.types"

export interface FetchRolesParams {
  token?: string | null
}

export async function fetchRoles(
  params: FetchRolesParams = {}
): Promise<Role[]> {
  const { token } = params
  return apiClient<Role[]>(`/roles`, { token })
}

export async function fetchRolePermissions(
  roleId: number,
  token?: string | null
): Promise<RolePermission[]> {
  return apiClient<RolePermission[]>(`/roles/${roleId}/permissions`, {
    token,
  })
}
