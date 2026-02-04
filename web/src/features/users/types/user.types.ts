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
