"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import type { PaginationMeta } from "@/shared/api-client"

const LIMIT_OPTIONS = [10, 25, 50, 100]

export interface DataTablePaginationProps {
  meta: PaginationMeta
  basePath: string
}

function buildPageUrl(
  basePath: string,
  page: number,
  limit: number,
  searchParams: URLSearchParams
) {
  const params = new URLSearchParams(searchParams)
  params.set("page", String(page))
  params.set("limit", String(limit))
  return `${basePath}?${params.toString()}`
}

export function DataTablePagination({ meta, basePath }: DataTablePaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { page, limit, total_pages, total_records, next_page, previous_page } =
    meta

  const start = total_records === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total_records)

  const handleLimitChange = (value: string) => {
    const url = buildPageUrl(basePath, 1, Number(value), searchParams)
    router.push(url)
  }

  const navigate = (p: number) => {
    router.push(buildPageUrl(basePath, p, limit, searchParams))
  }

  if (total_records === 0) {
    return (
      <div className="text-muted-foreground border-border/40 flex items-center justify-center border-t px-5 py-4 text-sm">
        No records found
      </div>
    )
  }

  const pageNumbers: (number | "ellipsis")[] = []
  const maxVisible = 5
  if (total_pages <= maxVisible) {
    for (let i = 1; i <= total_pages; i++) pageNumbers.push(i)
  } else {
    if (page <= 3) {
      for (let i = 1; i <= 4; i++) pageNumbers.push(i)
      pageNumbers.push("ellipsis")
      pageNumbers.push(total_pages)
    } else if (page >= total_pages - 2) {
      pageNumbers.push(1)
      pageNumbers.push("ellipsis")
      for (let i = total_pages - 3; i <= total_pages; i++) pageNumbers.push(i)
    } else {
      pageNumbers.push(1)
      pageNumbers.push("ellipsis")
      for (let i = page - 1; i <= page + 1; i++) pageNumbers.push(i)
      pageNumbers.push("ellipsis")
      pageNumbers.push(total_pages)
    }
  }

  return (
    <div className="border-border/40 flex flex-col gap-4 rounded-b-lg border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-muted-foreground text-sm">
          Showing{" "}
          <span className="font-medium text-foreground">{start}</span>
          {" – "}
          <span className="font-medium text-foreground">{end}</span>
          {" of "}
          <span className="font-medium text-foreground">{total_records}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Rows per page</span>
          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="h-8 w-[72px] border-border/60 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {total_pages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 border-border/60"
            disabled={!previous_page}
            onClick={() => previous_page && navigate(previous_page)}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="flex items-center gap-0.5">
            {pageNumbers.map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 text-sm font-medium",
                    p === page && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                  onClick={() => navigate(p)}
                >
                  {p}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 border-border/60"
            disabled={!next_page}
            onClick={() => next_page && navigate(next_page)}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      )}
    </div>
  )
}
