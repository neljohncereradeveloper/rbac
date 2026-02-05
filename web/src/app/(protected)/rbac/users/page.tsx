"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlusIcon, ArchiveIcon, ArchiveRestoreIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { DataTableCard } from "@/shared/ui/data-table-card"
import { SearchForm } from "@/shared/ui/search-form"
import { TablePageSkeleton } from "@/shared/ui/table-page-skeleton"
import { useTableSearchParams } from "@/shared/hooks"
import { useAuth } from "@/features/auth"
import {
  useUsers,
  UsersTable,
  CreateUserDialog,
} from "@/features/rbac/users"
import { cn } from "@/shared/utils"

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
    router.push(`/rbac/users?${params.toString()}`)
  }

  function handleSearchSubmit(searchTerm: string) {
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("term", searchTerm)
      params.set("page", "1")
    } else {
      params.delete("term")
      params.set("page", "1")
    }
    router.push(`/rbac/users?${params.toString()}`)
  }

  return (
    <>
      <DataTableCard
        title="Users list"
        searchSlot={
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <SearchForm
              onSubmit={handleSearchSubmit}
              placeholder="Search"
              defaultValue={term}
              submitLabel="Search"
              showSubmitButton={false}
            />
            {is_archived === "false" && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <PlusIcon className="size-4" />
                Create user
              </Button>
            )}
          </div>
        }
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
                <Button
                  type="button"
                  role="tab"
                  aria-selected={is_archived === "false"}
                  variant={is_archived === "false" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setArchiveFilter("false")}
                  className={cn(
                    is_archived === "false" &&
                    "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                  )}
                >
                  <ArchiveRestoreIcon className="size-4" />
                  Active
                </Button>
                <Button
                  type="button"
                  role="tab"
                  aria-selected={is_archived === "true"}
                  variant={is_archived === "true" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setArchiveFilter("true")}
                  className={cn(
                    is_archived === "true" &&
                    "bg-gray-500 text-white hover:bg-gray-600 hover:text-white"
                  )}
                >
                  <ArchiveIcon className="size-4" />
                  Archived
                </Button>
              </div>
            </div>
            <UsersTable
              users={users}
              meta={meta}
              basePath="/rbac/users"
              token={token}
              onActionSuccess={refetch}
            />
          </>
        )}
      </DataTableCard>
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
