/**
 * Command for updating a role
 * Application layer command - simple type definition without validation
 */
export interface UpdateRoleCommand {
  name: string;
  description?: string | null;
}
