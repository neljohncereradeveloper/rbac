"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/lib/react-query"
import { fetchRoles } from "../api/roles-api"

export interface UseRolesOptions {
  token?: string | null
  term?: string
  is_archived?: "true" | "false"
}

export function useRoles(options: UseRolesOptions = {}) {
  const {
    token = null,
    term = "",
    is_archived = "false",
  } = options

  const query = useQuery({
    queryKey: queryKeys.roles.list({ token, term, is_archived }),
    queryFn: () =>
      fetchRoles({ term, is_archived, token: token! }),
    enabled: !!token,
  })

  return {
    roles: query.data ?? [],
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
