"use client"

import { useState, useEffect, useCallback } from "react"
import type { PaginationMeta } from "@/lib/api/types"
import { fetchRoles } from "../api/roles-api"
import type { Role } from "../types/role.types"

export interface UseRolesOptions {
  token?: string | null
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
}

export function useRoles(options: UseRolesOptions = {}) {
  const {
    token = null,
    page = 1,
    limit = 10,
    term = "",
    is_archived = "false",
  } = options

  const [roles, setRoles] = useState<Role[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!token) {
      setRoles([])
      setMeta(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchRoles({
        page,
        limit,
        term,
        is_archived,
        token,
      })
      setRoles(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch roles")
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [token, page, limit, term, is_archived])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { roles, meta, isLoading, error, refetch }
}
