export interface Role {
  id: number
  name: string
  description: string | null
  deleted_by: string | null
  deleted_at: string | null
  created_by: string | null
  created_at: string
  updated_by: string | null
  updated_at: string
}

export interface RolePermission {
  role_id: number
  permission_id: number
  permission_name?: string
  permission_resource?: string
  permission_action?: string
  permission_description?: string | null
}
