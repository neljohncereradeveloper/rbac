/**
 * Users API client - connect to RBAC backend users endpoints
 */

import { apiClient } from "@/lib/api/client"
import type { PaginatedResult } from "@/lib/api/types"
import type { User } from "../types/user.types"

export interface FetchUsersParams {
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
  token?: string | null
}

export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<PaginatedResult<User>> {
  const { page = 1, limit = 10, term = "", is_archived = "false", token } =
    params
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    term: term,
    is_archived,
  })
  return apiClient<PaginatedResult<User>>(`/users?${searchParams}`, { token })
}
