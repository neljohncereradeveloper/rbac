export class UpdatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}
