"use client"

import * as React from "react"
import { login as loginApi } from "./auth.api"
import { mapLoginResponseToUser } from "./auth.logic"
import type { User } from "./auth.types"

const TOKEN_KEY = "rbac_token"
const USER_KEY = "rbac_user"

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Hook that orchestrates auth API + state.
 * Used by AuthProvider - does not render UI.
 */
export function useAuthState() {
  const [user, setUser] = React.useState<User | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const storedToken = getStoredToken()
    const storedUser = getStoredUser()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const login = React.useCallback(
    async (username_or_email: string, password: string) => {
      const res = await loginApi(username_or_email, password)
      const userData = mapLoginResponseToUser(res)
      setToken(res.access_token)
      setUser(userData)
      localStorage.setItem(TOKEN_KEY, res.access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    },
    []
  )

  const logout = React.useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
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
