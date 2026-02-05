"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/shared/utils"
import { Button } from "@/shared/ui/button"
import { Card, CardContent } from "@/shared/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { useAuth } from "./auth-context"
import { loginSchema, type LoginFormData } from "./auth.schema"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username_or_email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormData) {
    setApiError(null)
    try {
      await login(data.username_or_email, data.password)
      const redirectTo = searchParams.get("redirect")
      router.push(redirectTo && redirectTo.startsWith("/rbac") ? redirectTo : "/rbac/users")
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Login failed")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your RBAC account
                </p>
              </div>
              {apiError && (
                <p className="text-destructive text-sm">{apiError}</p>
              )}
              <Field data-invalid={!!errors.username_or_email}>
                <FieldLabel htmlFor="username_or_email">
                  Username or Email
                </FieldLabel>
                <Input
                  id="username_or_email"
                  type="text"
                  {...register("username_or_email")}
                  placeholder="admin"
                  autoComplete="username"
                  aria-invalid={!!errors.username_or_email}
                />
                <FieldError
                  errors={
                    errors.username_or_email
                      ? [errors.username_or_email]
                      : undefined
                  }
                />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                />
                <FieldError
                  errors={errors.password ? [errors.password] : undefined}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Login"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Default: admin / admin123 (change after first login)
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
