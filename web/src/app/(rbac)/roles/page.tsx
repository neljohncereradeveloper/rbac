"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useTableSearchParams } from "@/hooks/use-table-search-params"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useRoles } from "@/features/roles/hooks/use-roles"
import { RolesTable } from "@/features/roles/components/roles-table"
import { cn } from "@/lib/utils"

function RolesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { page, limit, term, is_archived } = useTableSearchParams()
  const { token, isAuthenticated } = useAuth()
  const { roles, meta, isLoading, error, refetch } = useRoles({
    token: isAuthenticated ? token : null,
    page,
    limit,
    term,
    is_archived,
  })

  function setArchiveFilter(value: "true" | "false") {
    const params = new URLSearchParams(searchParams)
    params.set("is_archived", value)
    params.set("page", "1")
    router.push(`/roles?${params.toString()}`)
  }

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
          description="View roles and manage their permissions. Roles (Admin, Editor, Viewer) are statically defined and managed via seeders only."
        />
        <DataTableCard
          title="Roles list"
          searchConfig={{
            basePath: "/roles",
            placeholder: "Search roles by name...",
            defaultValue: term,
            // Note: Create role button removed - roles are statically defined in backend
            // (ADMIN, EDITOR, VIEWER) and managed via seeders only
            trailingActions: undefined,
          }}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view roles."
        >
          {isAuthenticated && (
            <>
              <div className="border-border mb-4 flex items-center justify-between border-b pb-4">
                <div
                  role="tablist"
                  aria-label="Filter by status"
                  className="bg-muted/50 inline-flex rounded-lg p-0.5"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={is_archived === "false"}
                    onClick={() => setArchiveFilter("false")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      is_archived === "false"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArchiveRestoreIcon className="size-4" />
                    Active
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={is_archived === "true"}
                    onClick={() => setArchiveFilter("true")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      is_archived === "true"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ArchiveIcon className="size-4" />
                    Archived
                  </button>
                </div>
              </div>
              <RolesTable
                roles={roles}
                meta={meta}
                basePath="/roles"
                token={token}
                onActionSuccess={refetch}
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
