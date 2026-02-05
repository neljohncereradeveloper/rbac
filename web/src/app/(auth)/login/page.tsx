import { Suspense } from "react"
import { LoginForm } from "@/features/auth"

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm md:max-w-4xl">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
