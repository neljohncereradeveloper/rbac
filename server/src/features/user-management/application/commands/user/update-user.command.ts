/**
 * Command for updating a user
 * Application layer command - simple type definition without validation
 * Note: Username cannot be updated - it is immutable after creation
 */
export interface UpdateUserCommand {
  email?: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: Date | null;
  is_active?: boolean;
  is_email_verified?: boolean;
}
