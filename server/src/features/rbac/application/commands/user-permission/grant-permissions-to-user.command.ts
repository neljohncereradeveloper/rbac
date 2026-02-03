/**
 * Command for granting permissions to a user
 * Application layer command - simple type definition without validation
 */
export interface GrantPermissionsToUserCommand {
  user_id: number;
  permission_ids: number[];
  replace?: boolean;
}
