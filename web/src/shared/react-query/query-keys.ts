/**
 * Centralized query key factories for React Query
 * Ensures consistent query key structure across the app
 */

export const queryKeys = {
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (filters: {
      token?: string | null
    }) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: number, token?: string | null) =>
      [...queryKeys.roles.details(), id, token] as const,
    // Note: combobox removed - not used in web app
    permissions: (roleId: number, token?: string | null) =>
      [...queryKeys.roles.all, "permissions", roleId, token] as const,
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: {
      token?: string | null
      page?: number
      limit?: number
      term?: string
      is_archived?: "true" | "false"
    }) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: number, token?: string | null) =>
      [...queryKeys.users.details(), id, token] as const,
    combobox: (token?: string | null) =>
      [...queryKeys.users.all, "combobox", token] as const,
    roles: (userId: number, token?: string | null) =>
      [...queryKeys.users.all, "roles", userId, token] as const,
    permissions: (userId: number, token?: string | null) =>
      [...queryKeys.users.all, "permissions", userId, token] as const,
  },
  permissions: {
    all: ["permissions"] as const,
    lists: () => [...queryKeys.permissions.all, "list"] as const,
    list: (filters: {
      token?: string | null
    }) => [...queryKeys.permissions.lists(), filters] as const,
    // Note: combobox removed - not used in web app
  },
} as const
