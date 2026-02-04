"use client"

import { useState, useEffect, useMemo } from "react"
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
import { assignPermissionsToRole, fetchRolePermissions } from "../api/roles-api"
import { fetchPermissions } from "@/features/permissions/api/permissions-api"
import type { Role } from "../types/role.types"
import type { Permission } from "@/features/permissions/types/permission.types"

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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false)

  const groupedPermissions = useMemo(
    () => groupByResource(permissions),
    [permissions]
  )

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
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
        setSelectedIds(new Set(currentIds))
      } catch (err) {
        setPermissions([])
        setFetchError(err instanceof Error ? err.message : "Failed to load permissions")
        setSelectedIds(new Set())
      } finally {
        setIsLoadingPermissions(false)
      }
    }

    loadData()
  }, [open, token, role?.id])

  function togglePermission(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function selectAllInGroup(perms: Permission[]) {
    const permIds = new Set(perms.map((p) => p.id))
    const allSelected = perms.every((p) => selectedIds.has(p.id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        perms.forEach((p) => next.delete(p.id))
      } else {
        perms.forEach((p) => next.add(p.id))
      }
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === permissions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(permissions.map((p) => p.id)))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !role?.id) return
    setError(null)
    setIsLoading(true)
    try {
      await assignPermissionsToRole(role.id, {
        permission_ids: Array.from(selectedIds),
        replace: true,
        token,
      })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign permissions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-5xl max-h-[90vh] flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              Assign permissions {role ? `to ${role.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            {fetchError && (
              <p className="text-destructive text-sm">{fetchError}</p>
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
              disabled={isLoading || isLoadingPermissions}
            >
              {isLoading ? "Saving..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
