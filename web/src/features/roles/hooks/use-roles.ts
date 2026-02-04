"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/lib/react-query"
import { fetchRoles } from "../api/roles-api"

export interface UseRolesOptions {
  token?: string | null
}

export function useRoles(options: UseRolesOptions = {}) {
  const { token = null } = options

  const query = useQuery({
    queryKey: queryKeys.roles.list({ token }),
    queryFn: () => fetchRoles({ token: token! }),
    enabled: !!token,
  })

  return {
    roles: query.data ?? [],
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
