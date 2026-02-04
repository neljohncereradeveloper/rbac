"use client"

import { useState, useEffect, useCallback } from "react"
import type { PaginationMeta } from "@/lib/api/types"
import { fetchPermissions } from "../api/permissions-api"
import type { Permission } from "../types/permission.types"

export interface UsePermissionsOptions {
  token?: string | null
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const {
    token = null,
    page = 1,
    limit = 10,
    term = "",
    is_archived = "false",
  } = options

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!token) {
      setPermissions([])
      setMeta(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchPermissions({
        page,
        limit,
        term,
        is_archived,
        token,
      })
      setPermissions(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch permissions"
      )
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }, [token, page, limit, term, is_archived])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { permissions, meta, isLoading, error, refetch }
}
