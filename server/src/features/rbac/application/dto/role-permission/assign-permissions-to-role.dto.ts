export interface AssignPermissionsToRoleDto {
  role_id: number;
  permission_ids: number[];
  replace?: boolean;
}
