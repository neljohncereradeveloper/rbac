import { UserRole } from '../models/user-role.model';

/**
 * Manages the many-to-many relationship between users and roles.
 * Use this to assign or remove roles from a user.
 */
export interface UserRoleRepository<Context = unknown> {
  /** Create a single user-role link. */
  create(user_role: UserRole, context: Context): Promise<UserRole>;

  /** Assign roles to a user. Replaces existing assignments if replace is true. */
  assignToUser(
    user_id: number,
    role_ids: number[],
    context: Context,
    replace?: boolean,
  ): Promise<void>;

  /** Remove specific roles from a user. */
  removeFromUser(
    user_id: number,
    role_ids: number[],
    context: Context,
  ): Promise<void>;

  /** Get all role IDs assigned to a user. */
  findRoleIdsByUserId(user_id: number, context: Context): Promise<number[]>;

  /** Get all user-role links for a user. */
  findByUserId(user_id: number, context: Context): Promise<UserRole[]>;

  /** Check if a user has a specific role. */
  exists(user_id: number, role_id: number, context: Context): Promise<boolean>;
}
