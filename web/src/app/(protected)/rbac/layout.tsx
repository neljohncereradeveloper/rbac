"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PageBreadcrumb, PageShell } from "@/layout"
import type { PageBreadcrumbItem } from "@/layout"
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
} from "@/shared/ui/menubar"
import { cn } from "@/shared/utils"

const RBAC_SEGMENT_LABELS: Record<string, string> = {
    users: "Users",
    roles: "Roles",
    permissions: "Permissions",
}

const RBAC_MENU_ITEMS = [
    { href: "/rbac/users", label: "Users" },
    { href: "/rbac/roles", label: "Roles" },
    { href: "/rbac/permissions", label: "Permissions" },
] as const

function getRbacBreadcrumbItems(pathname: string): PageBreadcrumbItem[] {
    const segments = pathname.split("/").filter(Boolean)
    if (segments[0] !== "rbac") {
        return []
    }
    const items: PageBreadcrumbItem[] = [{ label: "RBAC", href: "/rbac" }]
    const segment = segments[1]
    if (segment) {
        items.push({
            label: RBAC_SEGMENT_LABELS[segment] ?? segment,
        })
    }
    return items
}

export default function RbacLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const items = getRbacBreadcrumbItems(pathname)
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    return (
        <>
            <PageBreadcrumb items={items} />
            <PageShell>
                {mounted ? (
                    <Menubar className="w-full shadow-md">
                        {RBAC_MENU_ITEMS.map(({ href, label }) => {
                            const isActive = pathname === href
                            return (
                                <MenubarMenu key={href}>
                                    <MenubarTrigger
                                        asChild
                                        className={cn(
                                            isActive &&
                                            "bg-accent text-accent-foreground"
                                        )}
                                    >
                                        <Link href={href}>{label}</Link>
                                    </MenubarTrigger>
                                </MenubarMenu>
                            )
                        })}
                    </Menubar>
                ) : (
                    <nav
                        role="menubar"
                        aria-label="RBAC sections"
                        className="bg-background flex h-9 w-full items-center gap-1 rounded-md border p-1 shadow-xs"
                    >
                        {RBAC_MENU_ITEMS.map(({ href, label }) => {
                            const isActive = pathname === href
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    role="menuitem"
                                    className={cn(
                                        "focus:bg-accent focus:text-accent-foreground inline-flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden transition-colors",
                                        isActive &&
                                        "bg-accent text-accent-foreground"
                                    )}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>
                )}
                {children}
            </PageShell>
        </>
    )
}
