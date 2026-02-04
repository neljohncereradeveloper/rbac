import { Role } from '../models/role.model';

export interface RoleRepository<Context = unknown> {
  // Note: create(), update(), findPaginatedList(), and combobox() methods removed
  // Roles are statically defined (Admin, Editor, Viewer) and managed via seeders only
  // These methods are not used since roles cannot be created, updated, paginated, or used in comboboxes via the application
  findById(id: number, context: Context): Promise<Role | null>;
  findAll(context: Context): Promise<Role[]>;
  findByName(name: string, context: Context): Promise<Role | null>;
}
