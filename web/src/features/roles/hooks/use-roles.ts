"use client"

import { useQuery } from "@tanstack/react-query"
import type { PaginationMeta } from "@/lib/api/types"
import { queryKeys, getErrorMessage } from "@/lib/react-query"
import { fetchRoles } from "../api/roles-api"

export interface UseRolesOptions {
  token?: string | null
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
}

export function useRoles(options: UseRolesOptions = {}) {
  const {
    token = null,
    page = 1,
    limit = 10,
    term = "",
    is_archived = "false",
  } = options

  const query = useQuery({
    queryKey: queryKeys.roles.list({ token, page, limit, term, is_archived }),
    queryFn: () =>
      fetchRoles({ page, limit, term, is_archived, token: token! }),
    enabled: !!token,
  })

  return {
    roles: query.data?.data ?? [],
    meta: (query.data?.meta ?? null) as PaginationMeta | null,
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
