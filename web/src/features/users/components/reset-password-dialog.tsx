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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/user.schema"
import type { User } from "../types/user.types"
import { useResetPassword } from "../hooks/use-user-mutations"
import { ErrorAlert } from "@/components/ui/error-alert"

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
        onError: () => {
          // Error is displayed in the dialog via mutation.error
        },
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
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Reset password for user &quot;{user?.username}&quot;. The user
              will need to use this new password to log in.
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
                  errors={errors.new_password ? [errors.new_password] : undefined}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
