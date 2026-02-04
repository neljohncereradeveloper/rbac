/**
 * Permissions API client - connect to RBAC backend permissions endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { Permission } from "../types/permission.types"

export interface FetchPermissionsParams {
  token?: string | null
}

export interface ComboboxItem {
  value: string
  label: string
}

export async function fetchPermissions(
  params: FetchPermissionsParams = {}
): Promise<Permission[]> {
  const { token } = params
  return apiClient<Permission[]>(`/permissions`, { token })
}

export async function fetchPermissionsCombobox(
  token?: string | null
): Promise<ComboboxItem[]> {
  return apiClient<ComboboxItem[]>("/permissions/combobox/list", { token })
}
