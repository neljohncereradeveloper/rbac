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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/react-query"
import {
  createRoleSchema,
  type CreateRoleFormData,
} from "../schemas/role.schema"
import { useCreateRole } from "../hooks/use-role-mutations"

export interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
  onSuccess: () => void
}

const defaultValues: CreateRoleFormData = {
  name: "",
  description: "",
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  token,
  onSuccess,
}: CreateRoleDialogProps) {
  const createRoleMutation = useCreateRole()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [open, reset])

  async function onSubmit(data: CreateRoleFormData) {
    if (!token) return
    createRoleMutation.mutate(
      {
        name: data.name,
        description: data.description?.trim() || null,
        token,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {createRoleMutation.error && (
              <p className="text-destructive text-sm">
                {getErrorMessage(createRoleMutation.error)}
              </p>
            )}
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="create-role-name">Name</FieldLabel>
                <Input
                  id="create-role-name"
                  {...register("name")}
                  placeholder="e.g. Manager"
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="create-role-description">
                  Description
                </FieldLabel>
                <Input
                  id="create-role-description"
                  {...register("description")}
                  placeholder="Optional description"
                  aria-invalid={!!errors.description}
                />
                <FieldError errors={errors.description ? [errors.description] : undefined} />
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
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
