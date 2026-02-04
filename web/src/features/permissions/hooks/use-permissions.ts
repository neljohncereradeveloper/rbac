"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/lib/react-query"
import { fetchPermissions } from "../api/permissions-api"

export interface UsePermissionsOptions {
  token?: string | null
  term?: string
  is_archived?: "true" | "false"
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const {
    token = null,
    term = "",
    is_archived = "false",
  } = options

  const query = useQuery({
    queryKey: queryKeys.permissions.list({
      token,
      term,
      is_archived,
    }),
    queryFn: () =>
      fetchPermissions({ term, is_archived, token: token! }),
    enabled: !!token,
  })

  return {
    permissions: query.data ?? [],
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
