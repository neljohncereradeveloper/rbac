/**
 * Command for updating a user
 * Application layer command - simple type definition without validation
 */
export interface UpdateUserCommand {
  username?: string;
  email?: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: Date | null;
  is_active?: boolean;
  is_email_verified?: boolean;
}
