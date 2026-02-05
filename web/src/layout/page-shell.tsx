"use client"

import { cn } from "@/shared/utils"

export interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-4 p-4 pt-0",
        className
      )}
    >
      {children}
    </div>
  )
}
