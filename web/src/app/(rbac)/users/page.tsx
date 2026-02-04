"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlusIcon, ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { PageHeader, PageShell, PageTitle } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { DataTableCard } from "@/components/table/data-table-card"
import { TablePageSkeleton } from "@/components/table/table-page-skeleton"
import { useTableSearchParams } from "@/hooks/use-table-search-params"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { useUsers } from "@/features/users/hooks/use-users"
import { UsersTable } from "@/features/users/components/users-table"
import { CreateUserDialog } from "@/features/users/components/create-user-dialog"
import { cn } from "@/lib/utils"

function UsersPageContent() {
  const [createOpen, setCreateOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { page, limit, term, is_archived } = useTableSearchParams()
  const { token, isAuthenticated } = useAuth()
  const { users, meta, isLoading, error, refetch } = useUsers({
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
    router.push(`/users?${params.toString()}`)
  }

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
            trailingActions:
              isAuthenticated && is_archived === "false" ? (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon className="size-4" />
                  Create user
                </Button>
              ) : undefined,
          }}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          error={error}
          unauthenticatedMessage="Please log in to view users."
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
              <UsersTable
                users={users}
                meta={meta}
                basePath="/users"
                token={token}
                onActionSuccess={refetch}
              />
            </>
          )}
        </DataTableCard>
      </PageShell>
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        token={isAuthenticated ? token : null}
        onSuccess={refetch}
      />
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
