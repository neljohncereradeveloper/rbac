"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys, getErrorMessage } from "@/shared/react-query"
import { fetchUsersCombobox } from "./users.api"

export interface UseUsersComboboxOptions {
  token?: string | null
}

export function useUsersCombobox(options: UseUsersComboboxOptions = {}) {
  const { token = null } = options

  const query = useQuery({
    queryKey: queryKeys.users.combobox(token),
    queryFn: () => fetchUsersCombobox(token!),
    enabled: !!token,
  })

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: getErrorMessage(query.error),
    refetch: query.refetch,
  }
}
