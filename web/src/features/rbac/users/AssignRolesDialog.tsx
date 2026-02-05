"use client"

import { useState, useEffect } from "react"
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
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { fetchUserRoles } from "./users.api"
import { fetchRoles } from "../roles"
import type { User } from "./users.types"
import type { Role } from "../roles"
import {
  assignRolesSchema,
  type AssignRolesFormData,
} from "./users.schema"
import { useAssignRolesToUser } from "./useUserMutations"
import { ErrorAlert } from "@/shared/ui/error-alert"

export interface AssignRolesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  token: string | null
  onSuccess: () => void
}

export function AssignRolesDialog({
  open,
  onOpenChange,
  user,
  token,
  onSuccess,
}: AssignRolesDialogProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const assignRolesMutation = useAssignRolesToUser()
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { },
  } = useForm<AssignRolesFormData>({
    resolver: zodResolver(assignRolesSchema),
    defaultValues: { role_ids: [] },
  })
  const role_ids = watch("role_ids")
  const selectedIds = new Set(role_ids ?? [])

  useEffect(() => {
    if (!open) {
      reset({ role_ids: [] })
      return
    }
    if (!token) return

    setIsLoadingRoles(true)
    setFetchError(null)

    const loadData = async () => {
      try {
        const [rolesRes, userRolesRes] = await Promise.all([
          fetchRoles({ token }),
          user?.id ? fetchUserRoles(user.id, token) : Promise.resolve([]),
        ])

        const list = rolesRes ?? []
        list.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "en", {
            sensitivity: "base",
          })
        )
        setRoles(list)
        setFetchError(null)

        const currentIds = (userRolesRes ?? []).map((r) => r.role_id)
        setValue("role_ids", currentIds)
      } catch (err) {
        setRoles([])
        setFetchError(
          err instanceof Error ? err.message : "Failed to load roles"
        )
        setValue("role_ids", [])
      } finally {
        setIsLoadingRoles(false)
      }
    }

    loadData()
  }, [open, token, user?.id, setValue, reset])

  function toggleRole(id: number) {
    const current = role_ids ?? []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    setValue("role_ids", next)
  }

  function selectAll() {
    if (selectedIds.size === roles.length) {
      setValue("role_ids", [])
    } else {
      setValue("role_ids", roles.map((r) => r.id))
    }
  }

  function onSubmit(data: AssignRolesFormData) {
    if (!token || !user?.id) return
    assignRolesMutation.mutate(
      {
        userId: user.id,
        role_ids: data.role_ids,
        replace: true,
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
          assignRolesMutation.reset()
        }
      }}
    >
      <DialogContent className="flex max-w-lg max-h-[90vh] flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="wrap-break-word">
              Assign roles {user ? `to ${user.username}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
            {fetchError && (
              <ErrorAlert error={fetchError} className="mb-4" />
            )}
            {assignRolesMutation.error && (
              <ErrorAlert
                error={assignRolesMutation.error}
                className="mb-4"
              />
            )}
            <FieldGroup className="min-h-0 flex-1 flex flex-col">
              <Field className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                  <FieldLabel>Roles</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="w-full sm:w-auto"
                  >
                    {selectedIds.size === roles.length
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                </div>
                {isLoadingRoles ? (
                  <p className="text-muted-foreground text-sm">
                    Loading roles...
                  </p>
                ) : roles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No roles available.
                  </p>
                ) : (
                  <div className="border-input mt-2 max-h-[320px] overflow-y-auto rounded-lg border bg-muted/30 p-3 sm:p-4">
                    <div className="space-y-1">
                      {roles.map((role) => (
                        <label
                          key={role.id}
                          className="hover:bg-accent flex cursor-pointer items-start gap-2 rounded-sm px-2 py-2 sm:py-1.5 text-sm touch-manipulation"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(role.id)}
                            onChange={() => toggleRole(role.id)}
                            className="mt-0.5 size-4 sm:size-4 shrink-0 rounded border"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium wrap-break-word">
                              {role.name}
                            </span>
                            {role.description && (
                              <p className="text-muted-foreground text-xs wrap-break-word mt-0.5">
                                {role.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
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
              disabled={assignRolesMutation.isPending || isLoadingRoles}
              className="w-full sm:w-auto"
            >
              {assignRolesMutation.isPending ? "Saving..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
