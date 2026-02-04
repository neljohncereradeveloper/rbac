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
import { MoreHorizontalIcon, PencilIcon, ArchiveIcon, RotateCcwIcon, KeyIcon, EyeIcon } from "lucide-react"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import type { PaginationMeta } from "@/lib/api/types"
import type { Role } from "../types/role.types"
import { archiveRole, restoreRole } from "../api/roles-api"
import { UpdateRoleDialog } from "./update-role-dialog"
import { AssignPermissionsDialog } from "./assign-permissions-dialog"
import { ViewPermissionsDialog } from "./view-permissions-dialog"

export interface RolesTableProps {
  roles: Role[]
  meta: PaginationMeta | null
  basePath: string
  token: string | null
  onActionSuccess: () => void
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
  onActionSuccess,
}: RolesTableProps) {
  const [roleToUpdate, setRoleToUpdate] = useState<Role | null>(null)
  const [roleToAssign, setRoleToAssign] = useState<Role | null>(null)
  const [roleToView, setRoleToView] = useState<Role | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  async function handleArchive(role: Role) {
    if (!token || !role.id) return
    try {
      await archiveRole(role.id, token)
      onActionSuccess()
    } catch {
      // Error handled by API
    }
  }

  async function handleRestore(role: Role) {
    if (!token || !role.id) return
    try {
      await restoreRole(role.id, token)
      onActionSuccess()
    } catch {
      // Error handled by API
    }
  }

  const isArchived = (role: Role) => !!role.deleted_at

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.id}</TableCell>
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
                      {isArchived(role) ? (
                        <DropdownMenuItem
                          onClick={() => handleRestore(role)}
                        >
                          <RotateCcwIcon className="size-4" />
                          Restore
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleToUpdate(role)
                              setUpdateOpen(true)
                            }}
                          >
                            <PencilIcon className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleToView(role)
                              setViewOpen(true)
                            }}
                          >
                            <EyeIcon className="size-4" />
                            View permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleToAssign(role)
                              setAssignOpen(true)
                            }}
                          >
                            <KeyIcon className="size-4" />
                            Assign permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleArchive(role)}
                          >
                            <ArchiveIcon className="size-4" />
                            Archive
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {meta && <DataTablePagination meta={meta} basePath={basePath} />}
      <UpdateRoleDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        role={roleToUpdate}
        token={token}
        onSuccess={onActionSuccess}
      />
      <AssignPermissionsDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        role={roleToAssign}
        token={token}
        onSuccess={onActionSuccess}
      />
      <ViewPermissionsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        role={roleToView}
        token={token}
      />
    </>
  )
}
