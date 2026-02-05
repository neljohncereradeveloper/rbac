export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  RBAC: "/rbac",
  ROLES: "/rbac/roles",
  PERMISSIONS: "/rbac/permissions",
  USERS: "/rbac/users",
} as const

export const AUTH_COOKIES = {
  TOKEN: "rbac_token",
  USER: "rbac_user",
} as const
