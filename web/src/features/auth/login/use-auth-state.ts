"use client"

import * as React from "react"
import { login as loginApi } from "./auth.api"
import { mapLoginResponseToUser } from "./auth.logic"
import type { User } from "./auth.types"
import { setAuthCookies, deleteAuthCookies } from "./auth-actions"

export interface InitialAuth {
  token: string | null
  user: User | null
}

/**
 * Hook that orchestrates auth API + state.
 * Used by AuthProvider - does not render UI.
 * Auth is stored in cookies via Next.js cookies() for middleware-based route protection.
 */
export function useAuthState(initialAuth: InitialAuth) {
  const [user, setUser] = React.useState<User | null>(initialAuth.user)
  const [token, setToken] = React.useState<string | null>(initialAuth.token)
  const [isLoading, setIsLoading] = React.useState(false)

  const login = React.useCallback(
    async (username_or_email: string, password: string) => {
      const res = await loginApi(username_or_email, password)
      const userData = mapLoginResponseToUser(res)
      await setAuthCookies(res.access_token, userData)
      setToken(res.access_token)
      setUser(userData)
    },
    []
  )

  const logout = React.useCallback(async () => {
    await deleteAuthCookies()
    setToken(null)
    setUser(null)
  }, [])

  return {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }
}
