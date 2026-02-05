/**
 * Users API client - connect to RBAC backend users endpoints
 */

import { apiClient } from "@/shared/api-client"
import type { PaginatedResult } from "@/shared/api-client"
import type { User, UserPermission, UserRole, ComboboxItem } from "./users.types"

export interface FetchUsersParams {
  page?: number
  limit?: number
  term?: string
  is_archived?: "true" | "false"
  token?: string | null
}

export interface CreateUserParams {
  username: string
  email: string
  password: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  phone?: string | null
  date_of_birth?: string | null
  is_active?: boolean
  is_email_verified?: boolean
  token?: string | null
}

export interface UpdateUserParams {
  email?: string
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  phone?: string | null
  date_of_birth?: string | null
  is_active?: boolean
  is_email_verified?: boolean
  token?: string | null
}

export interface AssignRolesToUserParams {
  role_ids: number[]
  replace?: boolean
  token?: string | null
}

export interface ResetPasswordParams {
  new_password: string
  token?: string | null
}

export interface GrantPermissionsToUserParams {
  permission_ids: number[]
  replace?: boolean
  token?: string | null
}

export interface DenyPermissionsToUserParams {
  permission_ids: number[]
  replace?: boolean
  token?: string | null
}

export interface RemovePermissionsFromUserParams {
  permission_ids: number[]
  token?: string | null
}

export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<PaginatedResult<User>> {
  const { page = 1, limit = 10, term = "", is_archived = "false", token } =
    params
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    term: term,
    is_archived,
  })
  return apiClient<PaginatedResult<User>>(`/users?${searchParams}`, { token })
}

export async function fetchUserById(
  id: number,
  token?: string | null
): Promise<User> {
  return apiClient<User>(`/users/${id}`, { token })
}

export async function createUser(params: CreateUserParams): Promise<User> {
  const {
    username,
    email,
    password,
    first_name,
    middle_name,
    last_name,
    phone,
    date_of_birth,
    is_active = true,
    is_email_verified = false,
    token,
  } = params
  const body: Record<string, unknown> = {
    username,
    email,
    password,
    first_name: first_name ?? null,
    middle_name: middle_name ?? null,
    last_name: last_name ?? null,
    phone: phone ?? null,
    date_of_birth: date_of_birth ?? null,
    is_active,
    is_email_verified,
  }
  return apiClient<User>("/users", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  })
}

export async function updateUser(
  id: number,
  params: UpdateUserParams
): Promise<User | null> {
  const {
    email,
    first_name,
    middle_name,
    last_name,
    phone,
    date_of_birth,
    is_active,
    is_email_verified,
    token,
  } = params
  const body: Record<string, unknown> = {}
  if (email !== undefined) body.email = email
  if (first_name !== undefined) body.first_name = first_name ?? null
  if (middle_name !== undefined) body.middle_name = middle_name ?? null
  if (last_name !== undefined) body.last_name = last_name ?? null
  if (phone !== undefined) body.phone = phone ?? null
  if (date_of_birth !== undefined) body.date_of_birth = date_of_birth ?? null
  if (is_active !== undefined) body.is_active = is_active
  if (is_email_verified !== undefined) body.is_email_verified = is_email_verified
  return apiClient<User | null>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    token,
  })
}

export async function archiveUser(
  id: number,
  token?: string | null
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/users/${id}/archive`, {
    method: "DELETE",
    token,
  })
}

export async function restoreUser(
  id: number,
  token?: string | null
): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/users/${id}/restore`, {
    method: "PATCH",
    token,
  })
}

export async function fetchUsersCombobox(
  token?: string | null
): Promise<ComboboxItem[]> {
  return apiClient<ComboboxItem[]>("/users/combobox/list", { token })
}

export async function fetchUserRoles(
  userId: number,
  token?: string | null
): Promise<UserRole[]> {
  return apiClient<UserRole[]>(`/users/${userId}/roles`, { token })
}

export async function assignRolesToUser(
  userId: number,
  params: AssignRolesToUserParams
): Promise<{ success: boolean }> {
  const { role_ids, replace, token } = params
  const body: { role_ids: number[]; replace?: boolean } = { role_ids }
  if (replace !== undefined) {
    body.replace = replace
  }
  return apiClient<{ success: boolean }>(`/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  })
}

export async function resetPassword(
  userId: number,
  params: ResetPasswordParams
): Promise<{ success: boolean }> {
  const { new_password, token } = params
  return apiClient<{ success: boolean }>(`/users/${userId}/change-password`, {
    method: "POST",
    body: JSON.stringify({ new_password }),
    token,
  })
}

export async function fetchUserPermissions(
  userId: number,
  token?: string | null
): Promise<UserPermission[]> {
  return apiClient<UserPermission[]>(`/users/${userId}/permissions`, {
    token,
  })
}

export async function grantPermissionsToUser(
  userId: number,
  params: GrantPermissionsToUserParams
): Promise<{ success: boolean }> {
  const { permission_ids, replace, token } = params
  const body: { permission_ids: number[]; replace?: boolean } = {
    permission_ids,
  }
  if (replace !== undefined) {
    body.replace = replace
  }
  return apiClient<{ success: boolean }>(
    `/users/${userId}/permissions/grant`,
    {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }
  )
}

export async function denyPermissionsToUser(
  userId: number,
  params: DenyPermissionsToUserParams
): Promise<{ success: boolean }> {
  const { permission_ids, replace, token } = params
  const body: { permission_ids: number[]; replace?: boolean } = {
    permission_ids,
  }
  if (replace !== undefined) {
    body.replace = replace
  }
  return apiClient<{ success: boolean }>(`/users/${userId}/permissions/deny`, {
    method: "POST",
    body: JSON.stringify(body),
    token,
  })
}

export async function removePermissionsFromUser(
  userId: number,
  params: RemovePermissionsFromUserParams
): Promise<{ success: boolean }> {
  const { permission_ids, token } = params
  return apiClient<{ success: boolean }>(`/users/${userId}/permissions`, {
    method: "DELETE",
    body: JSON.stringify({ permission_ids }),
    token,
  })
}
