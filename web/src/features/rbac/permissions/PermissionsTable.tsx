"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/utils"
import type { Permission } from "./permissions.types"
import {
  formatDate,
  groupByResource,
  formatResource,
} from "./permissions.logic"

export interface PermissionsTableProps {
  permissions: Permission[]
}

export function PermissionsTable({ permissions }: PermissionsTableProps) {
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

  if (permissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No permissions found</p>
      </div>
    )
  }

  return (
    <>
      {groupedPermissions.length > 1 && (
        <div className="flex flex-col gap-2 sm:flex-row items-start sm:items-center justify-start mb-4">
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
      <div className="space-y-2">
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
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {formatResource(resource)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {perms.length}{" "}
                    {perms.length === 1 ? "permission" : "permissions"}
                  </Badge>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-3 pt-3">
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-start justify-between gap-4 pb-3 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{perm.name}</h4>
                          {perm.action && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-xs"
                            >
                              {perm.action}
                            </Badge>
                          )}
                        </div>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground">
                            {perm.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Created:</span>
                          <time dateTime={perm.created_at}>
                            {formatDate(perm.created_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </>
  )
}
