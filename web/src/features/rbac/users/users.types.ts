export interface User {
  id: number
  username: string
  email: string
  first_name: string | null
  middle_name?: string | null
  last_name: string | null
  phone?: string | null
  date_of_birth?: string | null
  is_active?: boolean
  is_email_verified?: boolean
  deleted_by: string | null
  deleted_at: string | null
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}

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

export interface UserRole {
  user_id: number
  role_id: number
  created_by: string | null
  created_at: string
  username?: string
  role_description?: string | null
}

export interface ComboboxItem {
  value: string
  label: string
}
