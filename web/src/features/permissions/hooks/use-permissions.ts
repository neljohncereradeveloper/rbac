"use client"

import { useQuery } from "@tanstack/react-query"
import type { PaginationMeta } from "@/lib/api/types"
import { queryKeys, getErrorMessage } from "@/lib/react-query"
import { fetchPermissions } from "../api/permissions-api"
import type { Permission } from "../types/permission.types"

export interface UsePermissionsOptions {
  token?: string | null
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const {
    token = null,
    page = 1,
    limit = 10,
    term = "",
    is_archived = "false",
  } = options

  const query = useQuery({
    queryKey: queryKeys.permissions.list({
      token,
      page,
      limit,
      term,
      is_archived,
    }),
    queryFn: () =>
      fetchPermissions({ page, limit, term, is_archived, token: token! }),
    enabled: !!token,
  })

  return {
    permissions: query.data?.data ?? [],
    meta: (query.data?.meta ?? null) as PaginationMeta | null,
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
