import { PaginatedResult } from '@/core/utils/pagination.util';
import { User } from '../models/user.model';

export interface UserRepository<Context = unknown> {
  create(user: User, context: Context): Promise<User>;
  update(id: number, dto: Partial<User>, context: Context): Promise<boolean>;
  changePassword(id: number, user: User, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<User | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<User>>;
  findByUsername(username: string, context: Context): Promise<User | null>;
  findByEmail(email: string, context: Context): Promise<User | null>;
  combobox(context: Context): Promise<User[]>;
}
