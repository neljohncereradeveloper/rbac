"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { ErrorAlert } from "@/shared/ui/error-alert"
import { TableSearchForm } from "./table-search-form"

export interface DataTableCardSearchConfig {
  basePath: string
  placeholder: string
  defaultValue: string
  /** Rendered inline with search, aligned to the end (flex justify-between) */
  trailingActions?: React.ReactNode
}

export interface DataTableCardProps {
  title: string
  searchConfig?: DataTableCardSearchConfig
  /** Custom search slot (e.g. SearchForm). When provided, renders instead of searchConfig. */
  searchSlot?: React.ReactNode
  headerActions?: React.ReactNode
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  unauthenticatedMessage?: string
  children: React.ReactNode
}

export function DataTableCard({
  title,
  searchConfig,
  searchSlot,
  headerActions,
  isAuthenticated,
  isLoading,
  error,
  unauthenticatedMessage = "Please log in to view this content.",
  children,
}: DataTableCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{title}</CardTitle>
          {isAuthenticated && headerActions}
        </div>
        {isAuthenticated && (searchSlot ?? searchConfig) && (
          <div className="flex min-w-0 max-w-full items-center justify-between gap-4">
            {searchSlot ? (
              searchSlot
            ) : searchConfig ? (
              <>
                <div className="min-w-0 flex-1">
                  <TableSearchForm
                    key={searchConfig.defaultValue}
                    basePath={searchConfig.basePath}
                    placeholder={searchConfig.placeholder}
                    defaultValue={searchConfig.defaultValue}
                  />
                </div>
                {searchConfig.trailingActions}
              </>
            ) : null}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <p className="text-muted-foreground">{unauthenticatedMessage}</p>
        ) : error ? (
          <ErrorAlert error={error} />
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
