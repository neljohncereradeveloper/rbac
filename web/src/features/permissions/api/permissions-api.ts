/**
 * Permissions API client - connect to RBAC backend permissions endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { Permission } from "../types/permission.types"

export interface FetchPermissionsParams {
  token?: string | null
}

export async function fetchPermissions(
  params: FetchPermissionsParams = {}
): Promise<Permission[]> {
  const { token } = params
  return apiClient<Permission[]>(`/permissions`, { token })
}

// Note: fetchPermissionsCombobox removed - not used in web app
