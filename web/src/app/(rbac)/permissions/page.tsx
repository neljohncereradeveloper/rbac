"use client"

import { Suspense } from "react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionsTable } from "@/features/permissions/components/permissions-table"

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
          description="View permissions. Permissions are statically defined and managed via seeders only."
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
