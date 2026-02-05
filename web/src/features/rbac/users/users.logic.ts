/**
 * Business rules, validation, and mapping for users
 */

import type { User } from "./users.types"

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return "—"
  }
}

export function formatName(user: User): string {
  const parts = [user.first_name, user.middle_name, user.last_name].filter(
    (s) => s && s.trim()
  )
  return parts.length > 0 ? parts.join(" ") : "—"
}
