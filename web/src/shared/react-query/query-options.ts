/**
 * Centralized query options helpers for React Query
 * Provides consistent defaults and error handling
 */

import type { UseQueryOptions } from "@tanstack/react-query"

/**
 * Creates standardized query options with common defaults
 */
export function createQueryOptions<TData, TError = Error>(
  options: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> & {
    enabled?: boolean
  }
): Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> {
  return {
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? 60 * 1000, // 1 minute default
    gcTime: options.gcTime ?? 5 * 60 * 1000, // 5 minutes default (formerly cacheTime)
    retry: options.retry ?? 1,
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    ...options,
  }
}

/**
 * Extracts error message from query error
 */
export function getErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "An unknown error occurred"
}

/**
 * Checks if an error is an access denied error
 */
export function isAccessDeniedError(error: unknown): boolean {
  if (!error) return false

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase()

  return (
    errorMessage.includes("access denied") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("insufficient permissions") ||
    errorMessage.includes("don't have permission") ||
    errorMessage.includes("required role") ||
    errorMessage.includes("required permission")
  )
}
