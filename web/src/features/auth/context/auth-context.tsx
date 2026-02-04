"use client"

import * as React from "react"
import { login as loginApi } from "../api/auth-api"
import type { User } from "../types/auth.types"

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

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username_or_email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      const userData: User = {
        id: res.user.id,
        username: res.user.username,
        email: res.user.email,
        first_name: res.user.first_name,
        last_name: res.user.last_name,
      }
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

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
