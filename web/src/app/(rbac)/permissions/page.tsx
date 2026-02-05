"use client"

import { Suspense } from "react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
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
      <PageHeader
        items={[
          { label: "RBAC", href: "/rbac" },
          { label: "Permissions" },
        ]}
      />
      <PageShell>
        <PageTitle
          title="Permissions"
          description="View permissions. Permissions are system-defined and cannot be modified."
        />
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
      </PageShell>
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
