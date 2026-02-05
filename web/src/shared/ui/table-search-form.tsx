"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search } from "lucide-react"
import { Button } from "@/shared/ui/button"

const searchSchema = z.object({
  term: z
    .string()
    .max(255, "Search term must not exceed 255 characters"),
})

export type TableSearchFormValues = z.infer<typeof searchSchema>

export interface TableSearchFormProps {
  basePath: string
  placeholder?: string
  defaultValue?: string
}

export function TableSearchForm({
  basePath,
  placeholder = "Search...",
  defaultValue = "",
}: TableSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TableSearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      term: defaultValue || "",
    },
  })

  function onSubmit(values: TableSearchFormValues) {
    const params = new URLSearchParams(searchParams)
    const trimmed = values.term?.trim()
    if (trimmed) {
      params.set("term", trimmed)
      params.set("page", "1")
    } else {
      params.delete("term")
      params.set("page", "1")
    }
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-1.5"
    >
      <div className="border-input bg-muted/30 flex min-h-10 w-full min-w-[240px] items-stretch overflow-hidden rounded-lg border shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <label htmlFor="search-term" className="sr-only">
          Search
        </label>
        <div className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2 px-3 py-2">
          <Search className="size-4 shrink-0" aria-hidden />
          <input
            id="search-term"
            type="search"
            placeholder={placeholder}
            className="placeholder:text-muted-foreground bg-transparent w-full min-w-0 text-sm outline-none"
            {...register("term")}
            aria-invalid={!!errors.term}
            aria-describedby={errors.term ? "search-term-error" : undefined}
          />
        </div>
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={isSubmitting}
          className="h-full shrink-0 rounded-none border-l border-border/60 px-4 font-medium hover:bg-muted/50"
        >
          {isSubmitting ? "Searching…" : "Search"}
        </Button>
      </div>
      {errors.term && (
        <p id="search-term-error" className="text-destructive text-sm">
          {errors.term.message}
        </p>
      )}
    </form>
  )
}
