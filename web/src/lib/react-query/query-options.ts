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
