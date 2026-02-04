"use client"

import { Suspense } from "react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useTableSearchParams } from "@/hooks/use-table-search-params"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useUsers } from "@/features/users/hooks/use-users"
import { UsersTable } from "@/features/users/components/users-table"

function UsersPageContent() {
  const { page, limit, term } = useTableSearchParams()
  const { token, isAuthenticated } = useAuth()
  const { users, meta, isLoading, error } = useUsers({
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
          { label: "Users" },
        ]}
      />
      <PageShell>
        <PageTitle
          title="Users"
          description="Manage users and assign roles."
        />
        <DataTableCard
          title="Users list"
          searchConfig={{
            basePath: "/users",
            placeholder: "Search users by username or email...",
            defaultValue: term,
          }}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view users."
        >
          <UsersTable users={users} meta={meta} basePath="/users" />
        </DataTableCard>
      </PageShell>
    </>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={<TablePageSkeleton />}>
      <UsersPageContent />
    </Suspense>
  )
}
