"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/shared/react-query"
import { fetchRoles } from "./roles.api"

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
