"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

import { NavMain } from "@/layout/nav-main"
import { NavUser } from "@/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar"
import { useAuth } from "@/features/auth"

const navMain = [
  {
    title: "RBAC",
    url: "/rbac/users",
    icon: Shield,
    isActive: true,
    items: [
      { title: "Roles", url: "/rbac/roles" },
      { title: "Permissions", url: "/rbac/permissions" },
      { title: "Users", url: "/rbac/users" },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const logoutAndRedirect = async () => {
    await logout()
    router.push("/login")
  }
  const sidebarUser = user
    ? {
      name: `${user.first_name} ${user.last_name}`.trim() || user.username,
      email: user.email,
      avatar: "",
    }
    : { name: "Guest", email: "", avatar: "" }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/rbac/users">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <span className="font-semibold">RBAC</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} onLogout={logoutAndRedirect} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
