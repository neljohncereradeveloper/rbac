export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}
