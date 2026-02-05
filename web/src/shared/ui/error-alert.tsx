"use client"

import { AlertCircleIcon } from "lucide-react"
import { cn } from "@/shared/utils"
import { getErrorMessage, isAccessDeniedError } from "@/shared/react-query"
import { AccessDeniedAlert } from "./access-denied-alert"

export interface ErrorAlertProps {
  error: unknown
  className?: string
  /**
   * Custom message to display instead of the error message
   */
  message?: string
}

/**
 * Reusable component for displaying errors
 * Automatically detects access denied errors and uses AccessDeniedAlert
 */
export function ErrorAlert({ error, className, message }: ErrorAlertProps) {
  if (!error) return null

  const errorMessage = message || getErrorMessage(error)

  // Use AccessDeniedAlert for access denied errors
  if (isAccessDeniedError(error)) {
    return (
      <AccessDeniedAlert
        message={errorMessage || undefined}
        className={className}
      />
    )
  }

  // Use regular error alert for other errors
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
        <p className="font-medium">Error</p>
        <p className="mt-1 text-muted-foreground">{errorMessage}</p>
      </div>
    </div>
  )
}
