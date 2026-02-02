export class CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}
