"use client"

import { AuthProvider } from "@/features/auth"
import { QueryProvider } from "./query-provider"
import type { InitialAuth } from "@/features/auth"

export function Providers({
  children,
  initialAuth,
}: {
  children: React.ReactNode
  initialAuth: InitialAuth
}) {
  return (
    <QueryProvider>
      <AuthProvider initialAuth={initialAuth}>{children}</AuthProvider>
    </QueryProvider>
  )
}
