import { Permission } from '../models/permission.model';

export interface PermissionRepository<Context = unknown> {
  // Note: create(), update(), findPaginatedList(), and combobox() methods removed
  // Permissions are statically defined and managed via seeders only
  // Permissions are fetched without pagination and without filtering conditions
  findById(id: number, context: Context): Promise<Permission | null>;
  findAll(context: Context): Promise<Permission[]>;
  findByName(name: string, context: Context): Promise<Permission | null>;
  findByResourceAndAction(
    resource: string,
    action: string,
    context: Context,
  ): Promise<Permission | null>;
}
