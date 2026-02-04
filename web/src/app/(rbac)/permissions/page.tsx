"use client"

import { Suspense } from "react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useTableSearchParams } from "@/hooks/use-table-search-params"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionsTable } from "@/features/permissions/components/permissions-table"

function PermissionsPageContent() {
  const { page, limit, term } = useTableSearchParams()
  const { token, isAuthenticated } = useAuth()
  const { permissions, meta, isLoading, error } = usePermissions({
    token: isAuthenticated ? token : null,
    page,
    limit,
    term,
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
          description="Manage permissions and assign them to roles."
        />
        <DataTableCard
          title="Permissions list"
          searchConfig={{
            basePath: "/permissions",
            placeholder: "Search permissions by name...",
            defaultValue: term,
          }}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view permissions."
        >
          <PermissionsTable
            permissions={permissions}
            meta={meta}
            basePath="/permissions"
          />
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
