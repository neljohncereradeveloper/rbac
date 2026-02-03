/**
 * Command for changing a user's password
 * Application layer command - simple type definition without validation
 */
export interface ChangePasswordCommand {
  user_id: number;
  new_password: string;
}
