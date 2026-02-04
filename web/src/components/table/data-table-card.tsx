"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TableSearchForm } from "./table-search-form"

export interface DataTableCardSearchConfig {
  basePath: string
  placeholder: string
  defaultValue: string
}

export interface DataTableCardProps {
  title: string
  searchConfig?: DataTableCardSearchConfig
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  unauthenticatedMessage?: string
  children: React.ReactNode
}

export function DataTableCard({
  title,
  searchConfig,
  isAuthenticated,
  isLoading,
  error,
  unauthenticatedMessage = "Please log in to view this content.",
  children,
}: DataTableCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <CardTitle>{title}</CardTitle>
        {isAuthenticated && searchConfig && (
          <div className="min-w-0 max-w-full">
            <TableSearchForm
              key={searchConfig.defaultValue}
              basePath={searchConfig.basePath}
              placeholder={searchConfig.placeholder}
              defaultValue={searchConfig.defaultValue}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <p className="text-muted-foreground">{unauthenticatedMessage}</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
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
