export interface Permission {
  id: number
  name: string
  resource?: string
  action?: string
  description: string | null
  deleted_by: string | null
  deleted_at: string | null
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}
