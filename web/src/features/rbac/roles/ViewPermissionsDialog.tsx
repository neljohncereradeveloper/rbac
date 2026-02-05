"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import { Button } from "@/shared/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/utils"
import { fetchRolePermissions } from "./roles.api"
import type { Role, RolePermission } from "./roles.types"
import {
  groupByResource,
  formatResource,
} from "./roles.logic"

export interface ViewPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  token: string | null
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
  const [openResources, setOpenResources] = useState<Set<string>>(new Set())
  const [hasInitialized, setHasInitialized] = useState(false)

  const groupedPermissions = useMemo(
    () => groupByResource(permissions),
    [permissions]
  )

  useEffect(() => {
    if (
      groupedPermissions.length > 0 &&
      !hasInitialized &&
      openResources.size === 0
    ) {
      setOpenResources(new Set([groupedPermissions[0][0]]))
      setHasInitialized(true)
    }
  }, [groupedPermissions, hasInitialized, openResources.size])

  const toggleResource = (resource: string) => {
    setOpenResources((prev) => {
      const next = new Set(prev)
      if (next.has(resource)) {
        next.delete(resource)
      } else {
        next.add(resource)
      }
      return next
    })
  }

  const collapseAll = () => {
    setOpenResources(new Set())
  }

  const expandAll = () => {
    setOpenResources(new Set(groupedPermissions.map(([resource]) => resource)))
  }

  useEffect(() => {
    if (open && token && role?.id) {
      setIsLoading(true)
      setError(null)
      setHasInitialized(false)
      setOpenResources(new Set())
      fetchRolePermissions(role.id, token)
        .then((res) => setPermissions(res ?? []))
        .catch((err) => {
          setPermissions([])
          setError(
            err instanceof Error ? err.message : "Failed to load permissions"
          )
        })
        .finally(() => setIsLoading(false))
    } else if (!open) {
      setPermissions([])
      setOpenResources(new Set())
      setHasInitialized(false)
    }
  }, [open, token, role?.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-1 min-w-0">
              <DialogTitle className="wrap-break-word text-left">
                Permissions {role ? `for ${role.name}` : ""}
              </DialogTitle>
              {role?.description && (
                <DialogDescription className="text-sm wrap-break-word text-left">
                  {role.description}
                </DialogDescription>
              )}
              {!isLoading && permissions.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                  <span>
                    {permissions.length}{" "}
                    {permissions.length === 1 ? "permission" : "permissions"}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>
                    {groupedPermissions.length}{" "}
                    {groupedPermissions.length === 1
                      ? "resource group"
                      : "resource groups"}
                  </span>
                </div>
              )}
            </div>

          </div>
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
            <>
              <div className="flex flex-1 flex-col min-h-0 space-y-2 overflow-y-auto">
                {groupedPermissions.map(([resource, perms]) => {
                  const isOpen = openResources.has(resource)
                  return (
                    <Collapsible
                      key={resource}
                      open={isOpen}
                      onOpenChange={() => toggleResource(resource)}
                      className="border rounded-lg"
                    >
                      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors">
                        <span className="font-medium">
                          {formatResource(resource)}
                        </span>
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <ul className="space-y-1.5 pt-2">
                          {perms.map((perm) => (
                            <li
                              key={perm.permission_id}
                              className="flex flex-col gap-0.5 rounded-sm px-2 py-1.5 text-sm"
                            >
                              <span className="font-medium">
                                {perm.permission_name ??
                                  perm.permission_action ??
                                  "—"}
                              </span>
                              {perm.permission_description && (
                                <p className="text-muted-foreground text-xs">
                                  {perm.permission_description}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
              {!isLoading && permissions.length > 0 && (
                <div className="flex flex-col gap-2 sm:flex-row shrink-0 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    disabled={openResources.size === groupedPermissions.length}
                    className="w-full sm:w-auto"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    disabled={openResources.size === 0}
                    className="w-full sm:w-auto"
                  >
                    Collapse All
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
