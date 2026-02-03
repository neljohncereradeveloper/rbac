/**
 * Command for denying permissions to a user
 * Application layer command - simple type definition without validation
 */
export interface DenyPermissionsToUserCommand {
  user_id: number;
  permission_ids: number[];
  replace?: boolean;
}
