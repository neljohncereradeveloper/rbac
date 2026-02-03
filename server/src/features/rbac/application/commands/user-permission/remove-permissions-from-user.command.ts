/**
 * Command for removing permission overrides from a user
 * Application layer command - simple type definition without validation
 */
export interface RemovePermissionsFromUserCommand {
  user_id: number;
  permission_ids: number[];
}
