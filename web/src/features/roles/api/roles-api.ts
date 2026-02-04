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
