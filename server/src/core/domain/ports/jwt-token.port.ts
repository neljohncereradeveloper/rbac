import { JwtPayload } from '../models/jwt-payload.model';

/**
 * Port interface for JWT token operations
 * Used for generating and verifying JWT tokens
 */
export interface JwtTokenPort {
  /**
   * Generate a JWT token from payload
   * @param payload - The JWT payload containing user information
   * @returns The signed JWT token string
   */
  sign(payload: JwtPayload): string;

  /**
   * Verify and decode a JWT token
   * @param token - The JWT token string to verify
   * @returns The decoded JWT payload
   * @throws Error if token is invalid or expired
   */
  verify(token: string): JwtPayload;
}
