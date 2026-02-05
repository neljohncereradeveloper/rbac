/**
 * Auth API - connect to RBAC backend auth endpoints
 */

import { apiClient } from "@/shared/api-client"

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }
}

export async function login(
  username_or_email: string,
  password: string
): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username_or_email, password }),
  })
}
