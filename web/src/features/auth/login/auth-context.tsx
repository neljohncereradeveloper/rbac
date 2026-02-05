"use client"

import * as React from "react"
import { useAuthState, type InitialAuth } from "./use-auth-state"
import type { User } from "./auth.types"

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username_or_email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  initialAuth,
}: {
  children: React.ReactNode
  initialAuth: InitialAuth
}) {
  const authState = useAuthState(initialAuth)
  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
