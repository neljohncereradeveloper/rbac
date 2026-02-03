/**
 * Command for updating a permission
 * Application layer command - simple type definition without validation
 */
export interface UpdatePermissionCommand {
  name: string;
  resource: string;
  action: string;
  description?: string | null;
}
