// Note: Install bcrypt: yarn add bcrypt
// Install types: yarn add -D @types/bcrypt
import * as bcrypt from 'bcrypt';

/**
 * Password utility functions
 * Provides password hashing and verification using bcrypt
 */
export class PasswordUtil {
  /**
   * Hash a plain text password
   * @param plainPassword Plain text password to hash
   * @param saltRounds Number of salt rounds (default: 10)
   * @returns Hashed password
   */
  static async hash(
    plainPassword: string,
    saltRounds: number = 10,
  ): Promise<string> {
    return bcrypt.hash(plainPassword, saltRounds);
  }

  /**
   * Verify a plain text password against a hashed password
   * @param plainPassword Plain text password to verify
   * @param hashedPassword Hashed password to compare against
   * @returns true if passwords match, false otherwise
   */
  static async verify(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    if (!hashedPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
