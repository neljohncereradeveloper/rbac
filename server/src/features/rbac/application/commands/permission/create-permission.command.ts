/**
 * Command for creating a permission
 * Application layer command - simple type definition without validation
 */
export interface CreatePermissionCommand {
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}
