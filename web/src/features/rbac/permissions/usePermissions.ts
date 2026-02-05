"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/shared/react-query"
import { fetchPermissions } from "./permissions.api"

export interface UsePermissionsOptions {
  token?: string | null
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const { token = null } = options

  const query = useQuery({
    queryKey: queryKeys.permissions.list({ token }),
    queryFn: () => fetchPermissions({ token: token! }),
    enabled: !!token,
  })

  return {
    permissions: query.data ?? [],
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
