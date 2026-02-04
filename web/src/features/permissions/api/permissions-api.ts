/**
 * Permissions API client - connect to RBAC backend permissions endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { Permission } from "../types/permission.types"

export interface FetchPermissionsParams {
  term?: string
  is_archived?: "true" | "false"
  token?: string | null
}

export interface ComboboxItem {
  value: string
  label: string
}

export async function fetchPermissions(
  params: FetchPermissionsParams = {}
): Promise<Permission[]> {
  const { term = "", is_archived = "false", token } = params
  const searchParams = new URLSearchParams({
    term: term,
    is_archived,
  })
  return apiClient<Permission[]>(`/permissions?${searchParams}`, { token })
}

export async function fetchPermissionsCombobox(
  token?: string | null
): Promise<ComboboxItem[]> {
  return apiClient<ComboboxItem[]>("/permissions/combobox/list", { token })
}
