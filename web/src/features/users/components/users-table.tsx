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
import {
  MoreHorizontalIcon,
  PencilIcon,
  ArchiveIcon,
  RotateCcwIcon,
  KeyIcon,
} from "lucide-react"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import type { PaginationMeta } from "@/lib/api/types"
import type { User } from "../types/user.types"
import { archiveUser, restoreUser } from "../api/users-api"
import { UpdateUserDialog } from "./update-user-dialog"
import { AssignRolesDialog } from "./assign-roles-dialog"

export interface UsersTableProps {
  users: User[]
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

function formatName(user: User): string {
  const parts = [user.first_name, user.middle_name, user.last_name].filter(
    (s) => s && s.trim()
  )
  return parts.length > 0 ? parts.join(" ") : "—"
}

export function UsersTable({
  users,
  meta,
  basePath,
  token,
  onActionSuccess,
}: UsersTableProps) {
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null)
  const [userToAssign, setUserToAssign] = useState<User | null>(null)
  const [userToArchive, setUserToArchive] = useState<User | null>(null)
  const [userToRestore, setUserToRestore] = useState<User | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)

  async function handleArchiveConfirm() {
    if (!token || !userToArchive?.id) return
    setArchiveLoading(true)
    try {
      await archiveUser(userToArchive.id, token)
      setArchiveOpen(false)
      setUserToArchive(null)
      onActionSuccess()
    } catch {
      // Error handled by API
    } finally {
      setArchiveLoading(false)
    }
  }

  async function handleRestoreConfirm() {
    if (!token || !userToRestore?.id) return
    setRestoreLoading(true)
    try {
      await restoreUser(userToRestore.id, token)
      setRestoreOpen(false)
      setUserToRestore(null)
      onActionSuccess()
    } catch {
      // Error handled by API
    } finally {
      setRestoreLoading(false)
    }
  }

  const isArchived = (user: User) => !!user.deleted_at

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatName(user)}</TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
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
                      {isArchived(user) ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setUserToRestore(user)
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
                              setUserToUpdate(user)
                              setUpdateOpen(true)
                            }}
                          >
                            <PencilIcon className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToAssign(user)
                              setAssignOpen(true)
                            }}
                          >
                            <KeyIcon className="size-4" />
                            Assign roles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setUserToArchive(user)
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
      <UpdateUserDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        user={userToUpdate}
        token={token}
        onSuccess={onActionSuccess}
      />
      <AssignRolesDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        user={userToAssign}
        token={token}
        onSuccess={onActionSuccess}
      />
      <Dialog
        open={archiveOpen}
        onOpenChange={(open) => {
          setArchiveOpen(open)
          if (!open) setUserToArchive(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive user</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive &quot;{userToArchive?.username}
              &quot;? This will soft-delete the user. You can restore them later
              from the Archived tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setArchiveOpen(false)
                setUserToArchive(null)
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
          if (!open) setUserToRestore(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore user</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore &quot;{userToRestore?.username}
              &quot;? The user will be active again and visible in the Active
              tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreOpen(false)
                setUserToRestore(null)
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
