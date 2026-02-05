"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/shared/utils"

function Tabs({
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

const tabsListVariants = {
  default:
    "bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1",
  underline:
    "border-border text-muted-foreground inline-flex h-12 w-full items-stretch gap-0 border-b bg-transparent p-0",
}

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.TabsList> & {
  variant?: "default" | "underline"
}) {
  return (
    <TabsPrimitive.TabsList
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants[variant], className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = {
  default:
    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
  underline:
    "text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-primary -mb-px inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:font-semibold",
}

function TabsTrigger({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.TabsTrigger> & {
  variant?: "default" | "underline"
}) {
  const listVariant = (props as { "data-variant"?: string })["data-variant"]
  const effectiveVariant = variant ?? (listVariant === "underline" ? "underline" : "default")
  return (
    <TabsPrimitive.TabsTrigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants[effectiveVariant], className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.TabsContent>) {
  return (
    <TabsPrimitive.TabsContent
      data-slot="tabs-content"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
