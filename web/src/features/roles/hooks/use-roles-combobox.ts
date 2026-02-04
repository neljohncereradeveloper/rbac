"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/lib/react-query"
import { fetchRolesCombobox } from "../api/roles-api"

export interface UseRolesComboboxOptions {
  token?: string | null
}

export function useRolesCombobox(options: UseRolesComboboxOptions = {}) {
  const { token = null } = options

  const query = useQuery({
    queryKey: queryKeys.roles.combobox(token),
    queryFn: () => fetchRolesCombobox(token!),
    enabled: !!token,
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
