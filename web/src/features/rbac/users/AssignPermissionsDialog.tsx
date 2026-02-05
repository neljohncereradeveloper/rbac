"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/collapsible"
import {
  CheckCircle2Icon,
  XCircleIcon,
  RotateCcwIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react"
import { fetchUserPermissions, fetchUserRoles } from "./users.api"
import { fetchPermissions } from "../permissions"
import { fetchRolePermissions, fetchRoles } from "../roles"
import type { User, UserPermission } from "./users.types"
import type { Permission } from "../permissions"
import {
  grantPermissionsSchema,
  denyPermissionsSchema,
  removePermissionsSchema,
  type GrantPermissionsFormData,
  type DenyPermissionsFormData,
  type RemovePermissionsFormData,
} from "./users.schema"
import {
  useGrantPermissionsToUser,
  useDenyPermissionsToUser,
  useRemovePermissionsFromUser,
} from "./useUserMutations"
import { ErrorAlert } from "@/shared/ui/error-alert"
import { cn } from "@/shared/utils"

export interface AssignPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  token: string | null
  onSuccess: () => void
}

type PermissionGroup = {
  resource: string
  permissions: Permission[]
}

export function AssignPermissionsDialog({
  open,
  onOpenChange,
  user,
  token,
  onSuccess,
}: AssignPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
  const [userRoles, setUserRoles] = useState<
    Array<{ role_id: number; role_name: string }>
  >([])
  const [rolePermissionsMap, setRolePermissionsMap] = useState<
    Map<number, number[]>
  >(new Map())
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"grant" | "deny" | "remove">(
    "grant"
  )
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set()
  )
  const [hasManuallyCollapsed, setHasManuallyCollapsed] = useState(false)

  const grantMutation = useGrantPermissionsToUser()
  const denyMutation = useDenyPermissionsToUser()
  const removeMutation = useRemovePermissionsFromUser()

  const grantForm = useForm<GrantPermissionsFormData>({
    resolver: zodResolver(grantPermissionsSchema),
    defaultValues: { permission_ids: [] },
  })

  const denyForm = useForm<DenyPermissionsFormData>({
    resolver: zodResolver(denyPermissionsSchema),
    defaultValues: { permission_ids: [] },
  })

  const removeForm = useForm<RemovePermissionsFormData>({
    resolver: zodResolver(removePermissionsSchema),
    defaultValues: { permission_ids: [] },
  })

  const grantPermissionIds = grantForm.watch("permission_ids")
  const denyPermissionIds = denyForm.watch("permission_ids")
  const removePermissionIds = removeForm.watch("permission_ids")

  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    const groups = new Map<string, Permission[]>()

    permissions.forEach((permission) => {
      const resource =
        permission.resource || permission.name.split(":")[0] || "other"
      const normalizedResource = resource.toLowerCase()

      if (!groups.has(normalizedResource)) {
        groups.set(normalizedResource, [])
      }
      groups.get(normalizedResource)!.push(permission)
    })

    return Array.from(groups.entries())
      .map(([resource, perms]) => ({
        resource: resource.charAt(0).toUpperCase() + resource.slice(1),
        permissions: perms.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "en", {
            sensitivity: "base",
          })
        ),
      }))
      .sort((a, b) => a.resource.localeCompare(b.resource))
  }, [permissions])

  useEffect(() => {
    if (
      permissionGroups.length > 0 &&
      expandedResources.size === 0 &&
      !hasManuallyCollapsed
    ) {
      setExpandedResources(new Set(permissionGroups.map((g) => g.resource)))
    }
  }, [permissionGroups, expandedResources.size, hasManuallyCollapsed])

  useEffect(() => {
    if (!open) {
      grantForm.reset({ permission_ids: [] })
      denyForm.reset({ permission_ids: [] })
      removeForm.reset({ permission_ids: [] })
      setActiveTab("grant")
      setExpandedResources(new Set())
      setHasManuallyCollapsed(false)
      return
    }
    if (!token) return

    setIsLoading(true)
    setFetchError(null)

    const loadData = async () => {
      try {
        const [permissionsRes, userPermissionsRes, userRolesRes, rolesRes] =
          await Promise.all([
            fetchPermissions({ token }),
            user?.id
              ? fetchUserPermissions(user.id, token)
              : Promise.resolve([]),
            user?.id ? fetchUserRoles(user.id, token) : Promise.resolve([]),
            fetchRoles({ token }),
          ])

        const list = permissionsRes ?? []
        setPermissions(list)
        setUserPermissions(userPermissionsRes ?? [])

        const rolesMap = new Map<number, string>()
        if (rolesRes) {
          rolesRes.forEach((role) => {
            if (role.id) {
              rolesMap.set(role.id, role.name)
            }
          })
        }

        if (user?.id && userRolesRes && userRolesRes.length > 0) {
          const rolePermsMap = new Map<number, number[]>()
          const rolesWithNames: Array<{
            role_id: number
            role_name: string
          }> = []

          const rolePromises = userRolesRes.map(async (userRole) => {
            try {
              const rolePerms = await fetchRolePermissions(
                userRole.role_id,
                token
              )
              rolePermsMap.set(
                userRole.role_id,
                rolePerms.map((rp) => rp.permission_id)
              )
              rolesWithNames.push({
                role_id: userRole.role_id,
                role_name:
                  rolesMap.get(userRole.role_id) || `Role ${userRole.role_id}`,
              })
            } catch (err) {
              console.error(
                `Failed to fetch permissions for role ${userRole.role_id}:`,
                err
              )
              rolePermsMap.set(userRole.role_id, [])
              rolesWithNames.push({
                role_id: userRole.role_id,
                role_name:
                  rolesMap.get(userRole.role_id) || `Role ${userRole.role_id}`,
              })
            }
          })
          await Promise.all(rolePromises)
          setRolePermissionsMap(rolePermsMap)
          setUserRoles(rolesWithNames)
        } else {
          setRolePermissionsMap(new Map())
          setUserRoles([])
        }

        setFetchError(null)
      } catch (err) {
        setPermissions([])
        setUserPermissions([])
        setUserRoles([])
        setRolePermissionsMap(new Map())
        setFetchError(
          err instanceof Error ? err.message : "Failed to load permissions"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [open, token, user?.id, grantForm, denyForm, removeForm])

  const grantedPermissionIds = new Set(
    userPermissions.filter((up) => up.is_allowed).map((up) => up.permission_id)
  )
  const deniedPermissionIds = new Set(
    userPermissions.filter((up) => !up.is_allowed).map((up) => up.permission_id)
  )

  const permissionsFromRoles = useMemo(() => {
    const rolePermissionIds = new Set<number>()
    rolePermissionsMap.forEach((permissionIds) => {
      permissionIds.forEach((id) => rolePermissionIds.add(id))
    })
    return rolePermissionIds
  }, [rolePermissionsMap])

  const permissionRoleSources = useMemo(() => {
    const sources = new Map<number, string[]>()
    rolePermissionsMap.forEach((permissionIds, roleId) => {
      const role = userRoles.find((r) => r.role_id === roleId)
      const roleName = role?.role_name || `Role ${roleId}`
      permissionIds.forEach((permissionId) => {
        if (!sources.has(permissionId)) {
          sources.set(permissionId, [])
        }
        sources.get(permissionId)!.push(roleName)
      })
    })
    return sources
  }, [rolePermissionsMap, userRoles])

  const effectivePermissions = useMemo(() => {
    const effective = new Set<number>()
    permissionsFromRoles.forEach((id) => effective.add(id))
    grantedPermissionIds.forEach((id) => effective.add(id))
    deniedPermissionIds.forEach((id) => effective.delete(id))
    return effective
  }, [permissionsFromRoles, grantedPermissionIds, deniedPermissionIds])

  function toggleGrantPermission(id: number) {
    const current = grantPermissionIds ?? []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    grantForm.setValue("permission_ids", next)
  }

  function toggleDenyPermission(id: number) {
    const current = denyPermissionIds ?? []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    denyForm.setValue("permission_ids", next)
  }

  function toggleRemovePermission(id: number) {
    const current = removePermissionIds ?? []
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    removeForm.setValue("permission_ids", next)
  }

  function toggleResource(resource: string) {
    const newExpanded = new Set(expandedResources)
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource)
    } else {
      newExpanded.add(resource)
    }
    setExpandedResources(newExpanded)
  }

  function expandAllResources() {
    setExpandedResources(new Set(permissionGroups.map((g) => g.resource)))
  }

  function collapseAllResources() {
    setExpandedResources(new Set())
    setHasManuallyCollapsed(true)
  }

  function selectAllInTab() {
    if (activeTab === "grant") {
      const allIds = permissions
        .filter((p) => !effectivePermissions.has(p.id))
        .map((p) => p.id)
      grantForm.setValue("permission_ids", allIds)
    } else if (activeTab === "deny") {
      const allIds = permissions
        .filter((p) => effectivePermissions.has(p.id))
        .map((p) => p.id)
      denyForm.setValue("permission_ids", allIds)
    } else if (activeTab === "remove") {
      const allIds = userPermissions.map((up) => up.permission_id)
      removeForm.setValue("permission_ids", allIds)
    }
  }

  function deselectAllInTab() {
    if (activeTab === "grant") {
      grantForm.setValue("permission_ids", [])
    } else if (activeTab === "deny") {
      denyForm.setValue("permission_ids", [])
    } else if (activeTab === "remove") {
      removeForm.setValue("permission_ids", [])
    }
  }

  function onGrantSubmit(data: GrantPermissionsFormData) {
    if (!token || !user?.id) return
    grantMutation.mutate(
      {
        userId: user.id,
        permission_ids: data.permission_ids,
        replace: false,
        token,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
        onError: () => { },
      }
    )
  }

  function onDenySubmit(data: DenyPermissionsFormData) {
    if (!token || !user?.id) return
    denyMutation.mutate(
      {
        userId: user.id,
        permission_ids: data.permission_ids,
        replace: false,
        token,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
        onError: () => { },
      }
    )
  }

  function onRemoveSubmit(data: RemovePermissionsFormData) {
    if (!token || !user?.id) return
    removeMutation.mutate(
      {
        userId: user.id,
        permission_ids: data.permission_ids,
        token,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
        onError: () => { },
      }
    )
  }

  const currentMutation =
    activeTab === "grant"
      ? grantMutation
      : activeTab === "deny"
        ? denyMutation
        : removeMutation

  const selectedCount =
    activeTab === "grant"
      ? grantPermissionIds?.length ?? 0
      : activeTab === "deny"
        ? (denyPermissionIds?.filter((id) =>
          effectivePermissions.has(id)
        ).length ?? 0)
        : removePermissionIds?.length ?? 0

  function renderPermissionList(
    permissionsList: Permission[],
    isSelected: (id: number) => boolean,
    togglePermission: (id: number) => void,
    getStatusBadge: (permission: Permission) => React.ReactNode,
    isDisabled?: (id: number) => boolean
  ) {
    return (
      <div className="space-y-2">
        {permissionGroups.map((group) => {
          const groupPermissions = permissionsList.filter((p) =>
            group.permissions.some((gp) => gp.id === p.id)
          )
          if (groupPermissions.length === 0) return null

          const isExpanded = expandedResources.has(group.resource)
          const selectedInGroup = groupPermissions.filter((p) =>
            isSelected(p.id)
          ).length

          return (
            <Collapsible
              key={group.resource}
              open={isExpanded}
              onOpenChange={() => toggleResource(group.resource)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-muted transition-colors touch-manipulation">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isExpanded ? (
                    <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-semibold text-sm wrap-break-word">
                    {group.resource}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({selectedInGroup}/{groupPermissions.length})
                  </span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 sm:px-4 py-2">
                <div className="space-y-1">
                  {groupPermissions.map((permission) => {
                    const selected = isSelected(permission.id)
                    const disabled = isDisabled
                      ? isDisabled(permission.id)
                      : false
                    return (
                      <label
                        key={permission.id}
                        className={cn(
                          "flex items-start gap-2 rounded-sm px-2 sm:px-3 py-2 text-sm transition-colors touch-manipulation",
                          disabled
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer",
                          selected && !disabled
                            ? "bg-primary/10 hover:bg-primary/15"
                            : !disabled && "hover:bg-muted/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={disabled}
                          onChange={() =>
                            !disabled && togglePermission(permission.id)
                          }
                          className="mt-0.5 size-4 shrink-0 rounded border disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="font-medium wrap-break-word">
                              {permission.name}
                            </span>
                            {getStatusBadge(permission)}
                          </div>
                          {permission.description && (
                            <p className="text-muted-foreground text-xs mt-1 wrap-break-word">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          grantMutation.reset()
          denyMutation.reset()
          removeMutation.reset()
        }
      }}
    >
      <DialogContent className="flex max-w-xl max-h-[90vh] flex-col overflow-hidden">
        <DialogHeader className="shrink-0 -mb-5">
          <DialogTitle className="wrap-break-word">
            Manage permissions {user ? `for ${user.username}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4">
          {fetchError && (
            <ErrorAlert error={fetchError} className="mb-4" />
          )}
          {currentMutation.error && (
            <ErrorAlert error={currentMutation.error} className="mb-4" />
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "grant" | "deny" | "remove")
            }
            className="flex min-h-0 flex-col overflow-hidden"
          >
            <TabsList className="w-full grid grid-cols-3 border-b bg-secondary">
              <TabsTrigger value="grant" className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4" />
                Grant
              </TabsTrigger>
              <TabsTrigger value="deny" className="flex items-center gap-2">
                <XCircleIcon className="size-4" />
                Deny
              </TabsTrigger>
              <TabsTrigger value="remove" className="flex items-center gap-2">
                <RotateCcwIcon className="size-4" />
                Remove Overrides
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="grant"
              className="flex min-h-0 flex-1 flex-col overflow-hidden mt-4"
            >
              <form
                onSubmit={grantForm.handleSubmit(onGrantSubmit)}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <FieldGroup className="min-h-0 flex-1 flex flex-col">
                  <Field className="flex min-h-0 flex-1 flex-col">
                    <div className="flex flex-col gap-3 items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <FieldLabel>Grant Permissions</FieldLabel>
                        <p className="text-xs text-muted-foreground mt-1 wrap-break-word">
                          Override to explicitly allow permissions.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row shrink-0 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={
                            expandedResources.size === permissionGroups.length
                              ? collapseAllResources
                              : expandAllResources
                          }
                          className="w-full sm:w-auto"
                        >
                          {expandedResources.size === permissionGroups.length
                            ? "Collapse All"
                            : "Expand All"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={
                            selectedCount > 0 ? deselectAllInTab : selectAllInTab
                          }
                          className="w-full sm:w-auto"
                        >
                          {selectedCount > 0 ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                    </div>
                    {isLoading ? (
                      <p className="text-muted-foreground text-sm">
                        Loading permissions...
                      </p>
                    ) : permissions.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No permissions available.
                      </p>
                    ) : (
                      <div className="border-input max-h-[450px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                        {renderPermissionList(
                          permissions,
                          (id) => grantPermissionIds?.includes(id) ?? false,
                          toggleGrantPermission,
                          (permission) => {
                            const hasFromRoles =
                              permissionsFromRoles.has(permission.id)
                            const hasGranted =
                              grantedPermissionIds.has(permission.id)
                            const roleSources =
                              permissionRoleSources.get(permission.id) || []

                            if (hasGranted) {
                              return (
                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                  (Granted via override)
                                </span>
                              )
                            } else if (hasFromRoles) {
                              return (
                                <span
                                  className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                                  title={`From roles: ${roleSources.join(", ")}`}
                                >
                                  (From{" "}
                                  {roleSources.length === 1
                                    ? `Role: ${roleSources[0]}`
                                    : `${roleSources.length} Roles`}
                                  )
                                </span>
                              )
                            }
                            return null
                          },
                          (id) => effectivePermissions.has(id)
                        )}
                      </div>
                    )}
                  </Field>
                </FieldGroup>
                <DialogFooter className="shrink-0 mt-4 flex-col gap-2 sm:flex-row">
                  {/* <div className="flex items-center justify-between w-full sm:w-auto sm:order-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedCount} permission
                      {selectedCount !== 1 ? "s" : ""} selected
                    </span>
                  </div> */}
                  <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto sm:order-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={grantMutation.isPending || isLoading}
                      className="w-full sm:w-auto"
                    >
                      {grantMutation.isPending ? "Granting..." : "Grant"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent
              value="deny"
              className="flex min-h-0 flex-1 flex-col overflow-hidden mt-4"
            >
              <form
                onSubmit={denyForm.handleSubmit(onDenySubmit)}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <FieldGroup className="min-h-0 flex-1 flex flex-col">
                  <Field className="flex min-h-0 flex-1 flex-col ">
                    <div className="flex flex-col gap-3 items-start justify-between mb-3">
                      <div>
                        <FieldLabel>Deny Permissions</FieldLabel>
                        <p className="text-xs text-muted-foreground mt-1">
                          Override to explicitly block permissions.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={
                            expandedResources.size === permissionGroups.length
                              ? collapseAllResources
                              : expandAllResources
                          }
                        >
                          {expandedResources.size === permissionGroups.length
                            ? "Collapse All"
                            : "Expand All"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={
                            selectedCount > 0 ? deselectAllInTab : selectAllInTab
                          }
                        >
                          {selectedCount > 0 ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                    </div>
                    {isLoading ? (
                      <p className="text-muted-foreground text-sm">
                        Loading permissions...
                      </p>
                    ) : permissions.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No permissions available.
                      </p>
                    ) : (() => {
                      const existingPermissions = permissions.filter((p) =>
                        effectivePermissions.has(p.id)
                      )

                      if (existingPermissions.length === 0) {
                        return (
                          <div className="border-input max-h-[450px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                            <p className="text-muted-foreground text-sm py-4 text-center">
                              No permissions to deny. User doesn&apos;t have any
                              permissions that can be blocked.
                            </p>
                          </div>
                        )
                      }

                      return (
                        <div className="border-input max-h-[450px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                          {renderPermissionList(
                            existingPermissions,
                            (id) => denyPermissionIds?.includes(id) ?? false,
                            toggleDenyPermission,
                            (permission) => {
                              const isDenied =
                                deniedPermissionIds.has(permission.id)
                              const hasFromRoles =
                                permissionsFromRoles.has(permission.id)
                              const hasGranted =
                                grantedPermissionIds.has(permission.id)
                              const roleSources =
                                permissionRoleSources.get(permission.id) || []

                              if (isDenied) {
                                return (
                                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    (Currently denied)
                                  </span>
                                )
                              } else if (hasGranted) {
                                return (
                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    (Granted via override)
                                  </span>
                                )
                              } else if (hasFromRoles) {
                                return (
                                  <span
                                    className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                                    title={`From roles: ${roleSources.join(", ")}`}
                                  >
                                    (From{" "}
                                    {roleSources.length === 1
                                      ? `Role: ${roleSources[0]}`
                                      : `${roleSources.length} Roles`}
                                    )
                                  </span>
                                )
                              }
                              return null
                            }
                          )}
                        </div>
                      )
                    })()}
                  </Field>
                </FieldGroup>
                <DialogFooter className="shrink-0 mt-4">
                  <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto sm:order-1">
                    {/* <span className="text-sm text-muted-foreground">
                      {selectedCount} permission
                      {selectedCount !== 1 ? "s" : ""} selected
                    </span> */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={denyMutation.isPending || isLoading}
                        variant="destructive"
                      >
                        {denyMutation.isPending ? "Denying..." : "Deny"}
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent
              value="remove"
              className="flex min-h-0 flex-1 flex-col overflow-hidden mt-4"
            >
              <form
                onSubmit={removeForm.handleSubmit(onRemoveSubmit)}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <FieldGroup className="min-h-0 flex-1 flex flex-col">
                  <Field className="flex min-h-0 flex-1 flex-col">
                    <div className="flex flex-col gap-3 items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <FieldLabel>Remove Permission Overrides</FieldLabel>
                        <p className="text-xs text-muted-foreground mt-1 wrap-break-word">
                          Remove overrides to restore role-based permissions
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={
                          selectedCount > 0 ? deselectAllInTab : selectAllInTab
                        }
                        className="w-full sm:w-auto"
                      >
                        {selectedCount > 0 ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    {isLoading ? (
                      <p className="text-muted-foreground text-sm">
                        Loading permissions...
                      </p>
                    ) : userPermissions.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No permission overrides found.
                      </p>
                    ) : (
                      <div className="border-input max-h-[450px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                        <div className="space-y-2">
                          {permissionGroups.map((group) => {
                            const groupOverrides = userPermissions.filter(
                              (up) =>
                                group.permissions.some(
                                  (gp) => gp.id === up.permission_id
                                )
                            )
                            if (groupOverrides.length === 0) return null

                            return (
                              <div key={group.resource} className="space-y-1">
                                <div className="font-semibold text-sm px-2 py-1 text-muted-foreground wrap-break-word">
                                  {group.resource}
                                </div>
                                {groupOverrides.map((userPermission) => {
                                  const permission = permissions.find(
                                    (p) =>
                                      p.id === userPermission.permission_id
                                  )
                                  const isSelected =
                                    removePermissionIds?.includes(
                                      userPermission.permission_id
                                    )
                                  return (
                                    <label
                                      key={userPermission.permission_id}
                                      className={cn(
                                        "flex cursor-pointer items-start gap-2 rounded-sm px-2 sm:px-3 py-2 text-sm transition-colors touch-manipulation",
                                        isSelected
                                          ? "bg-primary/10 hover:bg-primary/15"
                                          : "hover:bg-muted/50"
                                      )}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          toggleRemovePermission(
                                            userPermission.permission_id
                                          )
                                        }
                                        className="mt-0.5 size-4 shrink-0 rounded border"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2 flex-wrap">
                                          <span className="font-medium wrap-break-word">
                                            {permission?.name ??
                                              `Permission ${userPermission.permission_id}`}
                                          </span>
                                          <span
                                            className={cn(
                                              "text-xs font-medium shrink-0",
                                              userPermission.is_allowed
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                            )}
                                          >
                                            (
                                            {userPermission.is_allowed
                                              ? "Granted"
                                              : "Denied"}
                                            )
                                          </span>
                                        </div>
                                        {permission?.description && (
                                          <p className="text-muted-foreground text-xs mt-1 wrap-break-word">
                                            {permission.description}
                                          </p>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </Field>
                </FieldGroup>
                <DialogFooter className="shrink-0 mt-4 flex-col gap-2 sm:flex-row">
                  {/* <div className="flex items-center justify-between w-full sm:w-auto sm:order-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedCount} override
                      {selectedCount !== 1 ? "s" : ""} selected
                    </span>
                  </div> */}
                  <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto sm:order-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={removeMutation.isPending || isLoading}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      {removeMutation.isPending ? "Removing..." : "Remove"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
