"use client"

import { useSearchParams } from "next/navigation"

export interface TableSearchParams {
  page: number
  limit: number
  term: string
  is_archived: "true" | "false"
}

export function useTableSearchParams(): TableSearchParams {
  const searchParams = useSearchParams()

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
  )
  const term = searchParams.get("term") ?? ""
  const is_archived =
    searchParams.get("is_archived") === "true" ? "true" : "false"

  return { page, limit, term, is_archived }
}
