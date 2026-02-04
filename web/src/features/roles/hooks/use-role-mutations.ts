"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
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
    onSuccess: () => {
      // Invalidate all role queries to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
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
    onSuccess: (_, variables) => {
      // Invalidate all role queries and the specific role detail
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.detail(variables.id),
      })
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
    },
  })
}
