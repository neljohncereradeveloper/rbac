/**
 * Command for verifying a user's email
 * Application layer command - simple type definition without validation
 */
export interface VerifyEmailCommand {
  user_id: number;
}
