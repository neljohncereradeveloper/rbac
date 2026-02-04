"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Permission } from "../types/permission.types"

export interface PermissionsTableProps {
  permissions: Permission[]
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return "—"
  }
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

export function PermissionsTable({
  permissions,
}: PermissionsTableProps) {
  // Group permissions by resource
  const groupedPermissions = useMemo(
    () => groupByResource(permissions),
    [permissions]
  )

  // If no permissions, show empty state
  if (permissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No permissions found</p>
      </div>
    )
  }

  // If only one group, show cards without tabs
  if (groupedPermissions.length === 1) {
    const [resource, perms] = groupedPermissions[0]
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Resource: {formatResource(resource)}
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perms.map((perm) => (
            <Card key={perm.id} className="flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {perm.name}
                  </CardTitle>
                  {perm.action && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {perm.action}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {perm.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {perm.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Created:</span>
                  <time dateTime={perm.created_at}>
                    {formatDate(perm.created_at)}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Multiple groups - show tabs with cards
  return (
    <Tabs
      defaultValue={groupedPermissions[0]?.[0] ?? "other"}
      className="w-full"
    >
      <TabsList
        variant="underline"
        className="w-full min-w-0 flex-nowrap justify-start overflow-x-auto pb-0 mb-4"
      >
        {groupedPermissions.map(([resource]) => (
          <TabsTrigger
            key={resource}
            value={resource}
            className="whitespace-nowrap"
          >
            {formatResource(resource)}
          </TabsTrigger>
        ))}
      </TabsList>
      {groupedPermissions.map(([resource, perms]) => (
        <TabsContent key={resource} value={resource} className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perms.map((perm) => (
              <Card key={perm.id} className="flex flex-col">
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-tight">
                      {perm.name}
                    </CardTitle>
                    {perm.action && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {perm.action}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {perm.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {perm.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Created:</span>
                    <time dateTime={perm.created_at}>
                      {formatDate(perm.created_at)}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
