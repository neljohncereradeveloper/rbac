"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/lib/react-query"
import {
  createUser,
  updateUser,
  archiveUser,
  restoreUser,
  assignRolesToUser,
  resetPassword,
  type CreateUserParams,
  type UpdateUserParams,
  type AssignRolesToUserParams,
  type ResetPasswordParams,
} from "../api/users-api"
import type { User } from "../types/user.types"

/**
 * Mutation hook for creating a user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateUserParams) => createUser(params),
    onSuccess: (data) => {
      // Invalidate all user queries to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success("User created successfully", {
        description: `User "${data.username}" has been created.`,
      })
    },
  })
}

/**
 * Mutation hook for updating a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & UpdateUserParams) =>
      updateUser(id, params),
    onSuccess: (data, variables) => {
      // Invalidate all user queries and the specific user detail
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      })
      toast.success("User updated successfully", {
        description: "User information has been updated.",
      })
    },
  })
}

/**
 * Mutation hook for archiving a user
 */
export function useArchiveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      archiveUser(id, token),
    onSuccess: (_, variables) => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      })
      toast.success("User archived successfully", {
        description: "The user has been archived and moved to the Archived tab.",
      })
    },
  })
}

/**
 * Mutation hook for restoring a user
 */
export function useRestoreUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      restoreUser(id, token),
    onSuccess: (_, variables) => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      })
      toast.success("User restored successfully", {
        description: "The user has been restored and is now active.",
      })
    },
  })
}

/**
 * Mutation hook for assigning roles to a user
 */
export function useAssignRolesToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & AssignRolesToUserParams) =>
      assignRolesToUser(userId, params),
    onSuccess: (_, variables) => {
      // Invalidate user queries and user roles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.roles(variables.userId),
      })
      toast.success("Roles assigned successfully", {
        description: `Roles have been assigned to the user.`,
      })
    },
  })
}

/**
 * Mutation hook for resetting a user's password
 */
export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & ResetPasswordParams) =>
      resetPassword(userId, params),
    onSuccess: (_, variables) => {
      // Invalidate user queries to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      })
    },
  })
}
