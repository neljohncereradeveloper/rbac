"use client"

import { useState, useEffect, useCallback } from "react"
import type { PaginationMeta } from "@/lib/api/types"
import { fetchUsers } from "../api/users-api"
import type { User } from "../types/user.types"

export interface UseUsersOptions {
  token?: string | null
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
}

export function useUsers(options: UseUsersOptions = {}) {
  const {
    token = null,
    page = 1,
    limit = 10,
    term = "",
    is_archived = "false",
  } = options

  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!token) {
      setUsers([])
      setMeta(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchUsers({
        page,
        limit,
        term,
        is_archived,
        token,
      })
      setUsers(result.data)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [token, page, limit, term, is_archived])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { users, meta, isLoading, error, refetch }
}
