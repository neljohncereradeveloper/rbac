/**
 * User Permission types
 */

export interface UserPermission {
  user_id: number
  permission_id: number
  is_allowed: boolean
  created_by: string | null
  created_at: string
  username?: string
  permission_name?: string
  permission_description?: string | null
}
