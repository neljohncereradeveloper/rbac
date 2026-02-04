"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { updateUser } from "../api/users-api"
import {
  updateUserSchema,
  type UpdateUserFormData,
} from "../schemas/user.schema"
import type { User } from "../types/user.types"

export interface UpdateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  token: string | null
  onSuccess: () => void
}

export function UpdateUserDialog({
  open,
  onOpenChange,
  user,
  token,
  onSuccess,
}: UpdateUserDialogProps) {
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      date_of_birth: "",
    },
  })

  useEffect(() => {
    if (user && open) {
      setApiError(null)
      reset({
        email: user.email ?? "",
        first_name: user.first_name ?? "",
        middle_name: user.middle_name ?? "",
        last_name: user.last_name ?? "",
        phone: user.phone ?? "",
        date_of_birth: user.date_of_birth
          ? new Date(user.date_of_birth).toISOString().slice(0, 10)
          : "",
      })
    }
  }, [user, open, reset])

  async function onSubmit(data: UpdateUserFormData) {
    if (!token || !user?.id) return
    try {
      await updateUser(user.id, {
        email: data.email,
        first_name: data.first_name?.trim() || null,
        middle_name: data.middle_name?.trim() || null,
        last_name: data.last_name?.trim() || null,
        phone: data.phone?.trim() || null,
        date_of_birth: data.date_of_birth || null,
        token,
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to update user")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {apiError && (
              <p className="text-destructive text-sm">{apiError}</p>
            )}
            {user && (
              <p className="text-muted-foreground text-sm">
                Username: <span className="font-medium">{user.username}</span>{" "}
                (cannot be changed)
              </p>
            )}
            <FieldGroup className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="update-user-email">Email</FieldLabel>
                <Input
                  id="update-user-email"
                  type="email"
                  {...register("email")}
                  placeholder="e.g. john@example.com"
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>
              <Field data-invalid={!!errors.first_name}>
                <FieldLabel htmlFor="update-user-first-name">
                  First name
                </FieldLabel>
                <Input
                  id="update-user-first-name"
                  {...register("first_name")}
                  placeholder="Optional"
                  aria-invalid={!!errors.first_name}
                />
                <FieldError errors={errors.first_name ? [errors.first_name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.middle_name}>
                <FieldLabel htmlFor="update-user-middle-name">
                  Middle name
                </FieldLabel>
                <Input
                  id="update-user-middle-name"
                  {...register("middle_name")}
                  placeholder="Optional"
                  aria-invalid={!!errors.middle_name}
                />
                <FieldError errors={errors.middle_name ? [errors.middle_name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.last_name}>
                <FieldLabel htmlFor="update-user-last-name">
                  Last name
                </FieldLabel>
                <Input
                  id="update-user-last-name"
                  {...register("last_name")}
                  placeholder="Optional"
                  aria-invalid={!!errors.last_name}
                />
                <FieldError errors={errors.last_name ? [errors.last_name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="update-user-phone">Phone</FieldLabel>
                <Input
                  id="update-user-phone"
                  {...register("phone")}
                  placeholder="e.g. +1-555-123-4567"
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={errors.phone ? [errors.phone] : undefined} />
              </Field>
              <Field data-invalid={!!errors.date_of_birth}>
                <FieldLabel htmlFor="update-user-date-of-birth">
                  Date of birth
                </FieldLabel>
                <Input
                  id="update-user-date-of-birth"
                  type="date"
                  {...register("date_of_birth")}
                  aria-invalid={!!errors.date_of_birth}
                />
                <FieldError errors={errors.date_of_birth ? [errors.date_of_birth] : undefined} />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
