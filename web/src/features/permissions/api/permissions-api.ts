/**
 * Permissions API client - connect to RBAC backend permissions endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { PaginatedResult } from "@/lib/api/types"
import type { Permission } from "../types/permission.types"

export interface FetchPermissionsParams {
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
  token?: string | null
}

export async function fetchPermissions(
  params: FetchPermissionsParams = {}
): Promise<PaginatedResult<Permission>> {
  const { page = 1, limit = 10, term = "", is_archived = "false", token } =
    params
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    term: term,
    is_archived,
  })
  return apiClient<PaginatedResult<Permission>>(
    `/permissions?${searchParams}`,
    { token }
  )
}
