"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/layout/app-sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/shared/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <SidebarProvider>
      {mounted ? (
        <AppSidebar />
      ) : (
        <Sidebar collapsible="icon">
          <SidebarHeader />
          <SidebarContent />
        </Sidebar>
      )}
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
