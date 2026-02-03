/**
 * Command for assigning permissions to a role
 * Application layer command - simple type definition without validation
 */
export interface AssignPermissionsToRoleCommand {
  role_id: number;
  permission_ids: number[];
  replace?: boolean;
}
