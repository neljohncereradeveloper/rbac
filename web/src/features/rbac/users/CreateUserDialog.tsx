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
  createUserSchema,
  type CreateUserFormData,
} from "./users.schema"
import { useCreateUser } from "./useUserMutations"
import { ErrorAlert } from "@/shared/ui/error-alert"

export interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
  onSuccess: () => void
}

const defaultValues: CreateUserFormData = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  phone: "",
  date_of_birth: "",
}

export function CreateUserDialog({
  open,
  onOpenChange,
  token,
  onSuccess,
}: CreateUserDialogProps) {
  const createUserMutation = useCreateUser()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset])

  function onSubmit(data: CreateUserFormData) {
    if (!token) return
    createUserMutation.mutate(
      {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.first_name?.trim() || null,
        middle_name: data.middle_name?.trim() || null,
        last_name: data.last_name?.trim() || null,
        phone: data.phone?.trim() || null,
        date_of_birth: data.date_of_birth || null,
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
          createUserMutation.reset()
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="wrap-break-word">Create user</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-4">
            {createUserMutation.error && (
              <ErrorAlert error={createUserMutation.error} className="mb-4" />
            )}
            <FieldGroup className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-4">
              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="create-user-username">Username</FieldLabel>
                <Input
                  id="create-user-username"
                  {...register("username")}
                  placeholder="e.g. john_doe"
                  aria-invalid={!!errors.username}
                />
                <FieldError
                  errors={errors.username ? [errors.username] : undefined}
                />
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
                <Input
                  id="create-user-email"
                  type="email"
                  {...register("email")}
                  placeholder="e.g. john@example.com"
                  aria-invalid={!!errors.email}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>
              <Field className="sm:col-span-2" data-invalid={!!errors.password}>
                <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
                <Input
                  id="create-user-password"
                  type="password"
                  {...register("password")}
                  placeholder="Min 8 characters"
                  aria-invalid={!!errors.password}
                />
                <FieldError
                  errors={errors.password ? [errors.password] : undefined}
                />
              </Field>
              <Field data-invalid={!!errors.first_name}>
                <FieldLabel htmlFor="create-user-first-name">
                  First name
                </FieldLabel>
                <Input
                  id="create-user-first-name"
                  {...register("first_name")}
                  placeholder="Optional"
                  aria-invalid={!!errors.first_name}
                />
                <FieldError
                  errors={errors.first_name ? [errors.first_name] : undefined}
                />
              </Field>
              <Field data-invalid={!!errors.middle_name}>
                <FieldLabel htmlFor="create-user-middle-name">
                  Middle name
                </FieldLabel>
                <Input
                  id="create-user-middle-name"
                  {...register("middle_name")}
                  placeholder="Optional"
                  aria-invalid={!!errors.middle_name}
                />
                <FieldError
                  errors={errors.middle_name ? [errors.middle_name] : undefined}
                />
              </Field>
              <Field data-invalid={!!errors.last_name}>
                <FieldLabel htmlFor="create-user-last-name">
                  Last name
                </FieldLabel>
                <Input
                  id="create-user-last-name"
                  {...register("last_name")}
                  placeholder="Optional"
                  aria-invalid={!!errors.last_name}
                />
                <FieldError
                  errors={errors.last_name ? [errors.last_name] : undefined}
                />
              </Field>
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="create-user-phone">Phone</FieldLabel>
                <Input
                  id="create-user-phone"
                  {...register("phone")}
                  placeholder="e.g. +1-555-123-4567"
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={errors.phone ? [errors.phone] : undefined} />
              </Field>
              <Field data-invalid={!!errors.date_of_birth}>
                <FieldLabel htmlFor="create-user-date-of-birth">
                  Date of birth
                </FieldLabel>
                <Input
                  id="create-user-date-of-birth"
                  type="date"
                  {...register("date_of_birth")}
                  aria-invalid={!!errors.date_of_birth}
                />
                <FieldError
                  errors={errors.date_of_birth ? [errors.date_of_birth] : undefined}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="shrink-0 flex-col gap-2 sm:flex-row">
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
              disabled={createUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createUserMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
