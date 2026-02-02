export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: Date | null;
  is_active?: boolean;
  is_email_verified?: boolean;
}
