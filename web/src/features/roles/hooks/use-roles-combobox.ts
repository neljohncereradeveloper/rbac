"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchRolesCombobox } from "../api/roles-api"
import type { ComboboxItem } from "../api/roles-api"

export interface UseRolesComboboxOptions {
  token?: string | null
}

export function useRolesCombobox(options: UseRolesComboboxOptions = {}) {
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
      const result = await fetchRolesCombobox(token)
      setItems(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch roles")
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
