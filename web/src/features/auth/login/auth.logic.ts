/**
 * Auth business logic - mapping, validation helpers
 */

import type { LoginResponse } from "./auth.api"
import type { User } from "./auth.types"

export function mapLoginResponseToUser(res: LoginResponse): User {
  return {
    id: res.user.id,
    username: res.user.username,
    email: res.user.email,
    first_name: res.user.first_name,
    last_name: res.user.last_name,
  }
}
