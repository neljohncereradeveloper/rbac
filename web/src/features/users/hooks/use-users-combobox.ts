"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchUsersCombobox } from "../api/users-api"
import type { ComboboxItem } from "../api/users-api"

export interface UseUsersComboboxOptions {
  token?: string | null
}

export function useUsersCombobox(options: UseUsersComboboxOptions = {}) {
  const { token = null } = options

  const [items, setItems] = useState<ComboboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!token) {
      setItems([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchUsersCombobox(token)
      setItems(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { items, isLoading, error, refetch }
}
