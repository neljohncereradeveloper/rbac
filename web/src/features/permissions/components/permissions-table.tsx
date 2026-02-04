"use client"

import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No permissions found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  // If only one group, show simple table
  if (groupedPermissions.length === 1) {
    const [resource, perms] = groupedPermissions[0]
    return (
      <>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Resource: {formatResource(resource)}
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perms.map((perm, index) => (
              <TableRow key={perm.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{perm.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {perm.action ?? "—"}
                </TableCell>
                <TableCell>{perm.description ?? "—"}</TableCell>
                <TableCell>{formatDate(perm.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )
  }

  // Multiple groups - show tabs
  return (
    <Tabs
      defaultValue={groupedPermissions[0]?.[0] ?? "other"}
      className="w-full"
    >
      <TabsList
        variant="underline"
        className="w-full min-w-0 flex-nowrap justify-start overflow-x-auto pb-0"
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
      {groupedPermissions.map(([resource, perms], groupIndex) => {
        // Calculate index offset for this resource group
        // Sum up all permissions from previous groups
        let groupStartIndex = 0
        for (let i = 0; i < groupIndex; i++) {
          const prevGroup = groupedPermissions[i]?.[1] ?? []
          groupStartIndex += prevGroup.length
        }

        return (
          <TabsContent key={resource} value={resource} className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perms.map((perm, index) => (
                  <TableRow key={perm.id}>
                    <TableCell>{groupStartIndex + index + 1}</TableCell>
                    <TableCell className="font-medium">{perm.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {perm.action ?? "—"}
                    </TableCell>
                    <TableCell>{perm.description ?? "—"}</TableCell>
                    <TableCell>{formatDate(perm.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
