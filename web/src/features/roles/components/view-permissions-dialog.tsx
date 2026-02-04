"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchRolePermissions } from "../api/roles-api"
import type { Role } from "../types/role.types"
import type { RolePermission } from "../api/roles-api"

export interface ViewPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  token: string | null
}

function groupByResource(permissions: RolePermission[]) {
  const groups = new Map<string, RolePermission[]>()
  for (const perm of permissions) {
    const raw = perm.permission_resource ?? "Other"
    const resource = raw.toLowerCase().trim()
    const list = groups.get(resource) ?? []
    list.push(perm)
    groups.set(resource, list)
  }
  return Array.from(groups.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  )
}

export function ViewPermissionsDialog({
  open,
  onOpenChange,
  role,
  token,
}: ViewPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const groupedPermissions = useMemo(
    () => groupByResource(permissions),
    [permissions]
  )

  useEffect(() => {
    if (open && token && role?.id) {
      setIsLoading(true)
      setError(null)
      fetchRolePermissions(role.id, token)
        .then((res) => setPermissions(res ?? []))
        .catch((err) => {
          setPermissions([])
          setError(err instanceof Error ? err.message : "Failed to load permissions")
        })
        .finally(() => setIsLoading(false))
    }
  }, [open, token, role?.id])

  function formatResource(resource: string): string {
    return resource
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Permissions {role ? `for ${role.name}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col min-h-0 space-y-4 py-4">
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          {isLoading ? (
            <p className="text-muted-foreground text-sm">
              Loading permissions...
            </p>
          ) : permissions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No permissions assigned to this role.
            </p>
          ) : (
            <Tabs
              defaultValue={groupedPermissions[0]?.[0] ?? "other"}
              className="flex flex-1 flex-col min-h-0"
            >
              <TabsList
                variant="underline"
                className="w-full min-w-0 flex-nowrap justify-start overflow-x-auto pb-0"
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
                    <ul className="space-y-1.5">
                      {perms.map((perm) => (
                        <li
                          key={perm.permission_id}
                          className="flex flex-col gap-0.5 rounded-sm px-2 py-1.5 text-sm"
                        >
                          <span className="font-medium">
                            {perm.permission_name ?? perm.permission_action ?? "—"}
                          </span>
                          {perm.permission_description && (
                            <p className="text-muted-foreground text-xs">
                              {perm.permission_description}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
