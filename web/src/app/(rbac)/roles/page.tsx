"use client"

import { Suspense } from "react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useTableSearchParams } from "@/hooks/use-table-search-params"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useRoles } from "@/features/roles/hooks/use-roles"
import { RolesTable } from "@/features/roles/components/roles-table"

function RolesPageContent() {
  const { page, limit, term } = useTableSearchParams()
  const { token, isAuthenticated } = useAuth()
  const { roles, meta, isLoading, error } = useRoles({
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
          { label: "Roles" },
        ]}
      />
      <PageShell>
        <PageTitle
          title="Roles"
          description="Manage roles and their permissions."
        />
        <DataTableCard
          title="Roles list"
          searchConfig={{
            basePath: "/roles",
            placeholder: "Search roles by name...",
            defaultValue: term,
          }}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view roles."
        >
          <RolesTable roles={roles} meta={meta} basePath="/roles" />
        </DataTableCard>
      </PageShell>
    </>
  )
}

export default function RolesPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <RolesPageContent />
    </Suspense>
  )
}
