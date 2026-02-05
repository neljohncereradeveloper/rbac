"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { EyeIcon } from "lucide-react"
import type { Role } from "./roles.types"
import { formatDate } from "./roles.logic"
import { ViewPermissionsDialog } from "./ViewPermissionsDialog"

export interface RolesTableProps {
  roles: Role[]
  token: string | null
}

export function RolesTable({ roles, token }: RolesTableProps) {
  const [roleToView, setRoleToView] = useState<Role | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  if (roles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No roles found</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-start justify-between gap-4 pb-4 border-b last:border-b-0 last:pb-0"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base">{role.name}</h3>
                {token && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRoleToView(role)
                      setViewOpen(true)
                    }}
                    className="shrink-0"
                  >
                    <EyeIcon className="size-4 mr-2" />
                    View Permissions
                  </Button>
                )}
              </div>
              {role.description && (
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Created:</span>
                <time dateTime={role.created_at}>
                  {formatDate(role.created_at)}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ViewPermissionsDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        role={roleToView}
        token={token}
      />
    </>
  )
}
