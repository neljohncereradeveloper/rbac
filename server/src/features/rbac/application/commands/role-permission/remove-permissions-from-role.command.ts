/**
 * Command for removing permissions from a role
 * Application layer command - simple type definition without validation
 */
export interface RemovePermissionsFromRoleCommand {
  role_id: number;
  permission_ids: number[];
}
