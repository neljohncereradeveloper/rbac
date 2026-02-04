"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { fetchRolePermissions } from "../api/roles-api"
import { fetchPermissions } from "@/features/permissions/api/permissions-api"
import type { Role } from "../types/role.types"
import type { Permission } from "@/features/permissions/types/permission.types"
import {
  assignPermissionsSchema,
  type AssignPermissionsFormData,
} from "../schemas/assign-permissions.schema"
import { useAssignPermissionsToRole } from "../hooks/use-role-mutations"
import { ErrorAlert } from "@/components/ui/error-alert"

export interface AssignPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  token: string | null
  onSuccess: () => void
}

function groupByResource(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>()
  for (const perm of permissions) {
    const raw = perm.resource ?? "Other"
    const resource = raw.toLowerCase().trim()
    const list = groups.get(resource) ?? []
    list.push(perm)
    groups.set(resource, list)
  }
  return Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  )
}

function formatResource(resource: string): string {
  return resource
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function AssignPermissionsDialog({
  open,
  onOpenChange,
  role,
  token,
  onSuccess,
}: AssignPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)
  const assignPermissionsMutation = useAssignPermissionsToRole()
  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { },
  } = useForm<AssignPermissionsFormData>({
    resolver: zodResolver(assignPermissionsSchema),
    defaultValues: { permission_ids: [] },
  })
  const permission_ids = watch("permission_ids")
  const selectedIds = new Set(permission_ids ?? [])

  const groupedPermissions = useMemo(
    () => groupByResource(permissions),
    [permissions]
  )

  useEffect(() => {
    if (!open) {
      reset({ permission_ids: [] })
      return
    }
    if (!token) return

    setIsLoadingPermissions(true)
    setFetchError(null)

    const loadData = async () => {
      try {
        const [permsRes, rolePermsRes] = await Promise.all([
          fetchPermissions({
            token,
            page: 1,
            limit: 100,
            term: "",
            is_archived: "false",
          }),
          role?.id ? fetchRolePermissions(role.id, token) : Promise.resolve([]),
        ])

        const list = permsRes.data ?? []
        list.sort((a, b) =>
          (a.resource ?? "").localeCompare(b.resource ?? "", "en", {
            sensitivity: "base",
          }) ||
          (a.name ?? "").localeCompare(b.name ?? "", "en", {
            sensitivity: "base",
          })
        )
        setPermissions(list)
        setFetchError(null)

        const currentIds = (rolePermsRes ?? []).map((p) => p.permission_id)
        setValue("permission_ids", currentIds)
      } catch (err) {
        setPermissions([])
        setFetchError(
          err instanceof Error ? err.message : "Failed to load permissions"
        )
        setValue("permission_ids", [])
      } finally {
        setIsLoadingPermissions(false)
      }
    }

    loadData()
  }, [open, token, role?.id, setValue, reset])

  function togglePermission(id: number) {
    const current = permission_ids ?? []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    setValue("permission_ids", next)
  }

  function selectAllInGroup(perms: Permission[]) {
    const allSelected = perms.every((p) => selectedIds.has(p.id))
    const current = permission_ids ?? []
    const next = new Set(current)
    if (allSelected) {
      perms.forEach((p) => next.delete(p.id))
    } else {
      perms.forEach((p) => next.add(p.id))
    }
    setValue("permission_ids", Array.from(next))
  }

  function selectAll() {
    if (selectedIds.size === permissions.length) {
      setValue("permission_ids", [])
    } else {
      setValue("permission_ids", permissions.map((p) => p.id))
    }
  }

  function onSubmit(data: AssignPermissionsFormData) {
    if (!token || !role?.id) return
    assignPermissionsMutation.mutate(
      {
        roleId: role.id,
        permission_ids: data.permission_ids,
        replace: true,
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
          assignPermissionsMutation.reset()
        }
      }}
    >
      <DialogContent className="flex max-w-5xl max-h-[90vh] flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>
              Assign permissions {role ? `to ${role.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
            {fetchError && (
              <ErrorAlert error={fetchError} className="mb-4" />
            )}
            {assignPermissionsMutation.error && (
              <ErrorAlert
                error={assignPermissionsMutation.error}
                className="mb-4"
              />
            )}
            <FieldGroup className="min-h-0 flex-1 flex flex-col">
              <Field className="flex min-h-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center justify-between">
                  <FieldLabel>Permissions</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    {selectedIds.size === permissions.length
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                </div>
                {isLoadingPermissions ? (
                  <p className="text-muted-foreground text-sm">
                    Loading permissions...
                  </p>
                ) : permissions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No permissions available.
                  </p>
                ) : (
                  <Tabs
                    defaultValue={groupedPermissions[0]?.[0] ?? "other"}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <TabsList
                      variant="underline"
                      className="w-full min-w-0 shrink-0 flex-nowrap justify-start overflow-x-auto pb-0"
                    >
                      {groupedPermissions.map(([resource]) => (
                        <TabsTrigger
                          key={resource}
                          value={resource}
                          variant="underline"
                          className="shrink-0 whitespace-nowrap"
                        >
                          {formatResource(resource)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <div className="border-input mt-4 flex-1 min-h-[320px] overflow-y-auto rounded-lg border bg-muted/30">
                      {groupedPermissions.map(([resource, perms]) => (
                        <TabsContent
                          key={resource}
                          value={resource}
                          className="mt-0 p-4 focus-visible:outline-none focus-visible:ring-0"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mb-2"
                            onClick={() => selectAllInGroup(perms)}
                          >
                            {perms.every((p) => selectedIds.has(p.id))
                              ? "Deselect all in group"
                              : "Select all in group"}
                          </Button>
                          <div className="space-y-1">
                            {perms.map((perm) => (
                              <label
                                key={perm.id}
                                className="hover:bg-accent flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                  className="mt-0.5 size-4 shrink-0 rounded border"
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="font-medium">{perm.name}</span>
                                  {perm.description && (
                                    <p className="text-muted-foreground text-xs">
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </div>
                  </Tabs>
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
              disabled={assignPermissionsMutation.isPending || isLoadingPermissions}
            >
              {assignPermissionsMutation.isPending ? "Saving..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
