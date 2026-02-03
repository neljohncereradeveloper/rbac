/**
 * Command for assigning roles to a user
 * Application layer command - simple type definition without validation
 */
export interface AssignRolesToUserCommand {
  user_id: number;
  role_ids: number[];
  replace?: boolean;
}
