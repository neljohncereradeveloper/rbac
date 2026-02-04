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
  updateRoleSchema,
  type UpdateRoleFormData,
} from "../schemas/role.schema"
import type { Role } from "../types/role.types"
import { useUpdateRole } from "../hooks/use-role-mutations"

export interface UpdateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  token: string | null
  onSuccess: () => void
}

export function UpdateRoleDialog({
  open,
  onOpenChange,
  role,
  token,
  onSuccess,
}: UpdateRoleDialogProps) {
  const updateRoleMutation = useUpdateRole()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (role && open) {
      reset({
        name: role.name,
        description: role.description ?? "",
      })
    }
  }, [role, open, reset])

  async function onSubmit(data: UpdateRoleFormData) {
    if (!token || !role?.id) return
    updateRoleMutation.mutate(
      {
        id: role.id,
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
            <DialogTitle>Edit role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {updateRoleMutation.error && (
              <p className="text-destructive text-sm">
                {getErrorMessage(updateRoleMutation.error)}
              </p>
            )}
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="update-role-name">Name</FieldLabel>
                <Input
                  id="update-role-name"
                  {...register("name")}
                  placeholder="e.g. Manager"
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={errors.name ? [errors.name] : undefined} />
              </Field>
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="update-role-description">
                  Description
                </FieldLabel>
                <Input
                  id="update-role-description"
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
            <Button type="submit" disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
