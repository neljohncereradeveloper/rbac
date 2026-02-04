export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  deleted_by: string | null
  deleted_at: string | null
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}
