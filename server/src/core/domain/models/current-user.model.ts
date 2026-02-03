/**
 * Current User interface
 * Represents the authenticated user attached to the request
 * This is returned by JwtStrategy.validate() and attached to request.user
 */
export interface CurrentUser {
  id?: number;
  username: string;
  email: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: Date | null;
}
