"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "./users.schema"
import type { User } from "./users.types"
import { useResetPassword } from "./useUserMutations"
import { ErrorAlert } from "@/shared/ui/error-alert"

export interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  token: string | null
  onSuccess: () => void
}

const defaultValues: ResetPasswordFormData = {
  new_password: "",
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  token,
  onSuccess,
}: ResetPasswordDialogProps) {
  const resetPasswordMutation = useResetPassword()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset])

  function onSubmit(data: ResetPasswordFormData) {
    if (!token || !user?.id) return
    resetPasswordMutation.mutate(
      {
        userId: user.id,
        new_password: data.new_password,
        token,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
        onError: () => { },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          resetPasswordMutation.reset()
        }
      }}
    >
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="wrap-break-word">Reset password</DialogTitle>
            <DialogDescription className="wrap-break-word">
              Reset password for user &quot;{user?.username}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {resetPasswordMutation.error && (
              <ErrorAlert error={resetPasswordMutation.error} />
            )}
            <FieldGroup>
              <Field data-invalid={!!errors.new_password}>
                <FieldLabel htmlFor="reset-password-new-password">
                  New password
                </FieldLabel>
                <Input
                  id="reset-password-new-password"
                  type="password"
                  {...register("new_password")}
                  placeholder="Min 8 characters, no spaces"
                  aria-invalid={!!errors.new_password}
                />
                <FieldError
                  errors={
                    errors.new_password ? [errors.new_password] : undefined
                  }
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={resetPasswordMutation.isPending}
              className="w-full sm:w-auto"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
