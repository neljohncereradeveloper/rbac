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
import type { Role } from "../types/role.types"

export interface RolesTableProps {
  roles: Role[]
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

export function RolesTable({ roles, meta, basePath }: RolesTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.id}</TableCell>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.description ?? "—"}</TableCell>
              <TableCell>{formatDate(role.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {meta && <DataTablePagination meta={meta} basePath={basePath} />}
    </>
  )
}
