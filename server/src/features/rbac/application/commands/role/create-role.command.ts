/**
 * Command for creating a role
 * Application layer command - simple type definition without validation
 */
export interface CreateRoleCommand {
  name: string;
  description?: string | null;
  permission_ids?: number[];
}
