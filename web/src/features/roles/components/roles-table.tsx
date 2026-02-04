"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontalIcon, EyeIcon } from "lucide-react"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import type { PaginationMeta } from "@/lib/api/types"
import type { Role } from "../types/role.types"
// Note: UpdateRoleDialog, AssignPermissionsDialog, Archive/Restore removed - roles are statically defined in backend
// (ADMIN, EDITOR, VIEWER) and managed via seeders only. Role-permission assignments are also managed via seeders.
// Archiving roles would break authorization checks since role names are hardcoded in controllers.
import { ViewPermissionsDialog } from "./view-permissions-dialog"

export interface RolesTableProps {
  roles: Role[]
  meta: PaginationMeta | null
  basePath: string
  token: string | null
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return "—"
  }
}

export function RolesTable({
  roles,
  meta,
  basePath,
  token,
}: RolesTableProps) {
  // Note: Edit role, Assign permissions, Archive/Restore removed - roles are statically defined in backend
  // (ADMIN, EDITOR, VIEWER) and managed via seeders only. Role-permission assignments are also managed via seeders.
  // Archiving roles would break authorization checks since role names are hardcoded in controllers.
  const [roleToView, setRoleToView] = useState<Role | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  // Calculate starting index based on current page
  const startIndex = meta ? (meta.page - 1) * meta.limit : 0

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role, index) => (
            <TableRow key={role.id}>
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description ?? "—"}</TableCell>
              <TableCell>{formatDate(role.created_at)}</TableCell>
              <TableCell>
                {token && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Edit role, Assign permissions, Archive/Restore removed - roles are statically defined */}
                      {/* Archiving roles would break authorization checks since role names are hardcoded */}
                      <DropdownMenuItem
                        onClick={() => {
                          setRoleToView(role)
                          setViewOpen(true)
                        }}
                      >
                        <EyeIcon className="size-4" />
                        View permissions
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {meta && <DataTablePagination meta={meta} basePath={basePath} />}
      {/* UpdateRoleDialog, AssignPermissionsDialog, Archive/Restore dialogs removed - roles are statically defined */}
      {/* Archiving roles would break authorization checks since role names are hardcoded in controllers */}
      <ViewPermissionsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        role={roleToView}
        token={token}
      />
    </>
  )
}
