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
import type { Permission } from "../types/permission.types"

export interface PermissionsTableProps {
  permissions: Permission[]
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

export function PermissionsTable({
  permissions,
  meta,
  basePath,
}: PermissionsTableProps) {
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
          {permissions.map((perm) => (
            <TableRow key={perm.id}>
              <TableCell>{perm.id}</TableCell>
              <TableCell className="font-medium">{perm.name}</TableCell>
              <TableCell>{perm.description ?? "—"}</TableCell>
              <TableCell>{formatDate(perm.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {meta && <DataTablePagination meta={meta} basePath={basePath} />}
    </>
  )
}
