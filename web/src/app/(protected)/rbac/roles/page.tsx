"use client"

import { Suspense } from "react"
import { DataTableCard } from "@/shared/ui/data-table-card"
import { TablePageSkeleton } from "@/shared/ui/table-page-skeleton"
import { useAuth } from "@/features/auth"
import { useRoles, RolesTable } from "@/features/rbac/roles"

function RolesPageContent() {
  const { token, isAuthenticated } = useAuth()
  // Note: Fetch all roles without any filtering conditions
  const { roles, isLoading, error } = useRoles({
    token: isAuthenticated ? token : null,
  })

  return (
    <>
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
