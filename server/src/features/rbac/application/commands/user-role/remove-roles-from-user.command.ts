/**
 * Command for removing roles from a user
 * Application layer command - simple type definition without validation
 */
export interface RemoveRolesFromUserCommand {
  user_id: number;
  role_ids: number[];
}
