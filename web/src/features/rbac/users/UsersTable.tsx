"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import {
  MoreHorizontalIcon,
  PencilIcon,
  ArchiveIcon,
  RotateCcwIcon,
  KeyIcon,
  CheckIcon,
  XIcon,
  LockIcon,
  ShieldIcon,
} from "lucide-react"
import { DataTablePagination } from "@/shared/ui/data-table-pagination"
import type { PaginationMeta } from "@/shared/api-client"
import type { User } from "./users.types"
import { formatName } from "./users.logic"
import { UpdateUserDialog } from "./UpdateUserDialog"
import { AssignRolesDialog } from "./AssignRolesDialog"
import { AssignPermissionsDialog } from "./AssignPermissionsDialog"
import { ResetPasswordDialog } from "./ResetPasswordDialog"
import { useArchiveUser, useRestoreUser } from "./useUserMutations"
import { ErrorAlert } from "@/shared/ui/error-alert"

export interface UsersTableProps {
  users: User[]
  meta: PaginationMeta | null
  basePath: string
  token: string | null
  onActionSuccess: () => void
}

function EmailVerifiedBadge({ verified }: { verified?: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
        <CheckIcon className="size-3" />
        Verified
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <XIcon className="size-3" />
      Not verified
    </span>
  )
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
  const [userToAssignPermissions, setUserToAssignPermissions] =
    useState<User | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(
    null
  )
  const [userToArchive, setUserToArchive] = useState<User | null>(null)
  const [userToRestore, setUserToRestore] = useState<User | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignPermissionsOpen, setAssignPermissionsOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const archiveUserMutation = useArchiveUser()
  const restoreUserMutation = useRestoreUser()

  function handleArchiveConfirm() {
    if (!token || !userToArchive?.id) return
    archiveUserMutation.mutate(
      { id: userToArchive.id, token },
      {
        onSuccess: () => {
          setArchiveOpen(false)
          setUserToArchive(null)
          onActionSuccess()
        },
        onError: () => { },
      }
    )
  }

  function handleRestoreConfirm() {
    if (!token || !userToRestore?.id) return
    restoreUserMutation.mutate(
      { id: userToRestore.id, token },
      {
        onSuccess: () => {
          setRestoreOpen(false)
          setUserToRestore(null)
          onActionSuccess()
        },
        onError: () => { },
      }
    )
  }

  const isArchived = (user: User) => !!user.deleted_at

  const startIndex = meta ? (meta.page - 1) * meta.limit : 0

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Is Email Verified</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{startIndex + index + 1}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatName(user)}</TableCell>
              <TableCell>
                <EmailVerifiedBadge verified={user.is_email_verified} />
              </TableCell>
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
                            onClick={() => {
                              setUserToAssignPermissions(user)
                              setAssignPermissionsOpen(true)
                            }}
                          >
                            <ShieldIcon className="size-4" />
                            Manage permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToResetPassword(user)
                              setResetPasswordOpen(true)
                            }}
                          >
                            <LockIcon className="size-4" />
                            Reset password
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
      <AssignPermissionsDialog
        open={assignPermissionsOpen}
        onOpenChange={(open) => {
          setAssignPermissionsOpen(open)
          if (!open) setUserToAssignPermissions(null)
        }}
        user={userToAssignPermissions}
        token={token}
        onSuccess={onActionSuccess}
      />
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={(open) => {
          setResetPasswordOpen(open)
          if (!open) setUserToResetPassword(null)
        }}
        user={userToResetPassword}
        token={token}
        onSuccess={onActionSuccess}
      />
      <Dialog
        open={archiveOpen}
        onOpenChange={(open) => {
          setArchiveOpen(open)
          if (!open) {
            setUserToArchive(null)
            archiveUserMutation.reset()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="wrap-break-word">
              Archive user
            </DialogTitle>
            <DialogDescription className="wrap-break-word">
              Are you sure you want to archive &quot;{userToArchive?.username}
              &quot;? This will soft-delete the user. You can restore them later
              from the Archived tab.
            </DialogDescription>
          </DialogHeader>
          {archiveUserMutation.error && (
            <ErrorAlert error={archiveUserMutation.error} />
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setArchiveOpen(false)
                setUserToArchive(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchiveConfirm}
              disabled={archiveUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              {archiveUserMutation.isPending ? "Archiving..." : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={restoreOpen}
        onOpenChange={(open) => {
          setRestoreOpen(open)
          if (!open) {
            setUserToRestore(null)
            restoreUserMutation.reset()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="wrap-break-word">
              Restore user
            </DialogTitle>
            <DialogDescription className="wrap-break-word">
              Are you sure you want to restore &quot;{userToRestore?.username}
              &quot;? The user will be active again and visible in the Active
              tab.
            </DialogDescription>
          </DialogHeader>
          {restoreUserMutation.error && (
            <ErrorAlert error={restoreUserMutation.error} />
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setRestoreOpen(false)
                setUserToRestore(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              disabled={restoreUserMutation.isPending}
              className="w-full sm:w-auto"
            >
              {restoreUserMutation.isPending ? "Restoring..." : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
