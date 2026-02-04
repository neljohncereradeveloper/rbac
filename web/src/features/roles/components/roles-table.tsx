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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [roleToArchive, setRoleToArchive] = useState<Role | null>(null)
  const [roleToRestore, setRoleToRestore] = useState<Role | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)

  async function handleArchiveConfirm() {
    if (!token || !roleToArchive?.id) return
    setArchiveLoading(true)
    try {
      await archiveRole(roleToArchive.id, token)
      setArchiveOpen(false)
      setRoleToArchive(null)
      onActionSuccess()
    } catch {
      // Error handled by API
    } finally {
      setArchiveLoading(false)
    }
  }

  async function handleRestoreConfirm() {
    if (!token || !roleToRestore?.id) return
    setRestoreLoading(true)
    try {
      await restoreRole(roleToRestore.id, token)
      setRestoreOpen(false)
      setRoleToRestore(null)
      onActionSuccess()
    } catch {
      // Error handled by API
    } finally {
      setRestoreLoading(false)
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
                          onClick={() => {
                            setRoleToRestore(role)
                            setRestoreOpen(true)
                          }}
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
                            onClick={() => {
                              setRoleToArchive(role)
                              setArchiveOpen(true)
                            }}
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
      <Dialog
        open={archiveOpen}
        onOpenChange={(open) => {
          setArchiveOpen(open)
          if (!open) setRoleToArchive(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive role</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;{roleToArchive?.name}&quot;?
              This will soft-delete the role. You can restore it later from the
              Archived tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setArchiveOpen(false)
                setRoleToArchive(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchiveConfirm}
              disabled={archiveLoading}
            >
              {archiveLoading ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={restoreOpen}
        onOpenChange={(open) => {
          setRestoreOpen(open)
          if (!open) setRoleToRestore(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore role</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore &quot;{roleToRestore?.name}&quot;?
              The role will be active again and visible in the Active tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreOpen(false)
                setRoleToRestore(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              disabled={restoreLoading}
            >
              {restoreLoading ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
