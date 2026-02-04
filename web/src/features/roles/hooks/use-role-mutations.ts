"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/react-query"
import {
  createRole,
  updateRole,
  archiveRole,
  restoreRole,
  assignPermissionsToRole,
  type CreateRoleParams,
  type UpdateRoleParams,
  type AssignPermissionsToRoleParams,
} from "../api/roles-api"

/**
 * Mutation hook for creating a role
 */
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateRoleParams) => createRole(params),
    onSuccess: (data) => {
      // Invalidate all role queries to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      toast.success("Role created successfully", {
        description: `Role "${data.name}" has been created.`,
      })
    },
  })
}

/**
 * Mutation hook for updating a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & UpdateRoleParams) =>
      updateRole(id, params),
    onSuccess: (data, variables) => {
      // Invalidate all role queries and the specific role detail
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.id),
      })
      if (data) {
        toast.success("Role updated successfully", {
          description: `Role "${data.name}" has been updated.`,
        })
      } else {
        toast.success("Role updated successfully")
      }
    },
  })
}

/**
 * Mutation hook for archiving a role
 */
export function useArchiveRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      archiveRole(id, token),
    onSuccess: (_, variables) => {
      // Invalidate all role queries
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.id),
      })
      toast.success("Role archived successfully", {
        description: "The role has been archived and moved to the Archived tab.",
      })
    },
  })
}

/**
 * Mutation hook for restoring a role
 */
export function useRestoreRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      restoreRole(id, token),
    onSuccess: (_, variables) => {
      // Invalidate all role queries
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.id),
      })
      toast.success("Role restored successfully", {
        description: "The role has been restored and is now active.",
      })
    },
  })
}

/**
 * Mutation hook for assigning permissions to a role
 */
export function useAssignPermissionsToRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      ...params
    }: { roleId: number } & AssignPermissionsToRoleParams) =>
      assignPermissionsToRole(roleId, params),
    onSuccess: (_, variables) => {
      // Invalidate role queries and role permissions
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.roleId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.permissions(variables.roleId),
      })
      toast.success("Permissions assigned successfully", {
        description: `Permissions have been assigned to the role.`,
      })
    },
  })
}
