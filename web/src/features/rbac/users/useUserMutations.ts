"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/shared/react-query"
import {
  createUser,
  updateUser,
  archiveUser,
  restoreUser,
  assignRolesToUser,
  resetPassword,
  grantPermissionsToUser,
  denyPermissionsToUser,
  removePermissionsFromUser,
  type CreateUserParams,
  type UpdateUserParams,
  type AssignRolesToUserParams,
  type ResetPasswordParams,
  type GrantPermissionsToUserParams,
  type DenyPermissionsToUserParams,
  type RemovePermissionsFromUserParams,
} from "./users.api"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateUserParams) => createUser(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success("User created successfully", {
        description: `User "${data.username}" has been created.`,
      })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...params }: { id: number } & UpdateUserParams) =>
      updateUser(id, params),
    onSuccess: (data, variables) => {
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

export function useArchiveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      archiveUser(id, token),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      })
      toast.success("User archived successfully", {
        description:
          "The user has been archived and moved to the Archived tab.",
      })
    },
  })
}

export function useRestoreUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, token }: { id: number; token: string }) =>
      restoreUser(id, token),
    onSuccess: (_, variables) => {
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

export function useAssignRolesToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & AssignRolesToUserParams) =>
      assignRolesToUser(userId, params),
    onSuccess: (_, variables) => {
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

export function useResetPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & ResetPasswordParams) =>
      resetPassword(userId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      })
    },
  })
}

export function useGrantPermissionsToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & GrantPermissionsToUserParams) =>
      grantPermissionsToUser(userId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.permissions(variables.userId),
      })
      toast.success("Permissions granted successfully", {
        description: `Permissions have been granted to the user.`,
      })
    },
  })
}

export function useDenyPermissionsToUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & DenyPermissionsToUserParams) =>
      denyPermissionsToUser(userId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.permissions(variables.userId),
      })
      toast.success("Permissions denied successfully", {
        description: `Permissions have been denied for the user.`,
      })
    },
  })
}

export function useRemovePermissionsFromUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      ...params
    }: { userId: number } & RemovePermissionsFromUserParams) =>
      removePermissionsFromUser(userId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.permissions(variables.userId),
      })
      toast.success("Permission overrides removed successfully", {
        description: `Permission overrides have been removed from the user.`,
      })
    },
  })
}
