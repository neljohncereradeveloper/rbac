"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query"
import {
  createUser,
  updateUser,
  archiveUser,
  restoreUser,
  assignRolesToUser,
  type CreateUserParams,
  type UpdateUserParams,
  type AssignRolesToUserParams,
} from "../api/users-api"
import type { User } from "../types/user.types"

/**
 * Mutation hook for creating a user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateUserParams) => createUser(params),
    onSuccess: () => {
      // Invalidate all user queries to refetch the list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
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
    onSuccess: (_, variables) => {
      // Invalidate all user queries and the specific user detail
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
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
    },
  })
}
