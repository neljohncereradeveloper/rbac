"use client"

import { AlertCircleIcon } from "lucide-react"
import { cn } from "@/shared/utils"

export interface AccessDeniedAlertProps {
  message?: string
  className?: string
}

/**
 * Reusable component for displaying access denied errors
 * Shows a consistent error message when user lacks permissions
 */
export function AccessDeniedAlert({
  message = "Access denied. You don't have permission to perform this action.",
  className,
}: AccessDeniedAlertProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircleIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium">Access Denied</p>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
