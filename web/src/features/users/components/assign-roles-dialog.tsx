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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { fetchUserRoles } from "../api/users-api"
import { fetchRoles } from "@/features/roles/api/roles-api"
import type { User } from "../types/user.types"
import type { Role } from "@/features/roles/types/role.types"
import {
  assignRolesSchema,
  type AssignRolesFormData,
} from "../schemas/assign-roles.schema"
import { useAssignRolesToUser } from "../hooks/use-user-mutations"

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
          fetchRoles({
            token,
            page: 1,
            limit: 100,
            term: "",
            is_archived: "false",
          }),
          user?.id ? fetchUserRoles(user.id, token) : Promise.resolve([]),
        ])

        const list = rolesRes.data ?? []
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
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-lg max-h-[90vh] flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>
              Assign roles {user ? `to ${user.username}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
            {fetchError && (
              <p className="text-destructive text-sm">{fetchError}</p>
            )}
            <FieldGroup className="min-h-0 flex-1 flex flex-col">
              <Field className="flex min-h-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center justify-between">
                  <FieldLabel>Roles</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
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
                  <div className="border-input mt-2 max-h-[320px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                    <div className="space-y-1">
                      {roles.map((role) => (
                        <label
                          key={role.id}
                          className="hover:bg-accent flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(role.id)}
                            onChange={() => toggleRole(role.id)}
                            className="mt-0.5 size-4 shrink-0 rounded border"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium">{role.name}</span>
                            {role.description && (
                              <p className="text-muted-foreground text-xs">
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
          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignRolesMutation.isPending || isLoadingRoles}
            >
              {assignRolesMutation.isPending ? "Saving..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
