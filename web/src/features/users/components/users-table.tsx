"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/table/data-table-pagination"
import type { PaginationMeta } from "@/lib/api/types"
import type { User } from "../types/user.types"

export interface UsersTableProps {
  users: User[]
  meta: PaginationMeta | null
  basePath: string
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return "—"
  }
}

export function UsersTable({ users, meta, basePath }: UsersTableProps) {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {meta && <DataTablePagination meta={meta} basePath={basePath} />}
    </>
  )
}
