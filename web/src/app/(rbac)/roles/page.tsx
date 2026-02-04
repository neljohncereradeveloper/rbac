"use client"

import { Suspense } from "react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useRoles } from "@/features/roles/hooks/use-roles"
import { RolesTable } from "@/features/roles/components/roles-table"

function RolesPageContent() {
  const { token, isAuthenticated } = useAuth()
  // Note: Fetch all roles without any filtering conditions
  const { roles, isLoading, error } = useRoles({
    token: isAuthenticated ? token : null,
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
          description="View roles and their permissions. Roles (Admin, Editor, Viewer) and their permission assignments are statically defined and managed via seeders only. Use user permission management to grant or deny specific permissions to individual users."
        />
        <DataTableCard
          title="Roles list"
          // Note: Search removed - fetch all roles without filtering
          // Roles are statically defined (ADMIN, EDITOR, VIEWER) and managed via seeders only
          searchConfig={undefined}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view roles."
        >
          {isAuthenticated && (
            <>
              {/* Archive filter tabs removed - roles cannot be archived as they are statically defined */}
              <RolesTable
                roles={roles}
                token={token}
              />
            </>
          )}
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
