/**
 * Base API client - shared fetch config and error handling for RBAC backend.
 * Uses relative /api/v1 so requests go through Next.js proxy (avoids CORS).
 */
const API_BASE =
  typeof window !== "undefined"
    ? "/api/v1"
    : process.env.API_BACKEND_URL
      ? `${process.env.API_BACKEND_URL}/api/v1`
      : "http://localhost:3220/api/v1"

export interface ApiOptions extends RequestInit {
  token?: string | null
}

export async function apiClient<T>(
  path: string,
  options?: ApiOptions
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {}
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? "Request failed")
  }
  return res.json()
}
