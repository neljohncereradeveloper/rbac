/**
 * JWT Payload interface
 * Contains user information to be encoded in the JWT token
 */
export interface JwtPayload {
  sub: number; // User ID
  username: string;
  email: string;
  iat?: number; // Issued at (automatically added by JWT)
  exp?: number; // Expiration (automatically added by JWT)
}
