"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { SearchForm } from "./search-form"

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

  function onSubmit(term: string) {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("term", term)
      params.set("page", "1")
    } else {
      params.delete("term")
      params.set("page", "1")
    }
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <SearchForm
      onSubmit={onSubmit}
      placeholder={placeholder}
      defaultValue={defaultValue}
      submitLabel="Search"
    />
  )
}
