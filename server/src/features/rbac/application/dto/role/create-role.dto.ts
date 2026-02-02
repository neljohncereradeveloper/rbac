export interface CreateRoleDto {
  name: string;
  description?: string | null;
  permission_ids?: number[];
}
