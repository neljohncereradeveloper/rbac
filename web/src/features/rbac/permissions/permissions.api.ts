/**
 * Permissions API client - connect to RBAC backend permissions endpoints
 */

import { apiClient } from "@/shared/api-client"
import type { Permission } from "./permissions.types"

export interface FetchPermissionsParams {
  token?: string | null
}

export async function fetchPermissions(
  params: FetchPermissionsParams = {}
): Promise<Permission[]> {
  const { token } = params
  return apiClient<Permission[]>(`/permissions`, { token })
}
