"use client"

import { Suspense } from "react"
import { DataTableCard } from "@/shared/ui/data-table-card"
import { TablePageSkeleton } from "@/shared/ui/table-page-skeleton"
import { useAuth } from "@/features/auth"
import { usePermissions, PermissionsTable } from "@/features/rbac/permissions"

function PermissionsPageContent() {
  const { token, isAuthenticated } = useAuth()
  const { permissions, isLoading, error } = usePermissions({
    token: isAuthenticated ? token : null,
  })

  return (
    <>
      <DataTableCard
          title="Permissions list"
          searchConfig={undefined}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view permissions."
        >
          {isAuthenticated && (
            <PermissionsTable permissions={permissions} />
          )}
        </DataTableCard>
    </>
  )
}

export default function PermissionsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <PermissionsPageContent />
    </Suspense>
  )
}
