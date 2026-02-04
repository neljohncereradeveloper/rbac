import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  UserRoleRepository,
  UserPermissionRepository,
  RolePermissionRepository,
  PermissionRepository,
  RoleRepository,
} from '@/features/rbac/domain/repositories';
import { RBAC_TOKENS } from '@/features/rbac/domain/constants';

/**
 * RBAC Service
 * Provides methods to check user roles and permissions
 */
@Injectable()
export class RbacService {
  constructor(
    @Inject(RBAC_TOKENS.USER_ROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(RBAC_TOKENS.USER_PERMISSION)
    private readonly userPermissionRepository: UserPermissionRepository,
    @Inject(RBAC_TOKENS.ROLE_PERMISSION)
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(RBAC_TOKENS.PERMISSION)
    private readonly permissionRepository: PermissionRepository,
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Check if user has any of the specified roles
   * @param userId User ID
   * @param roleNames Array of role names (e.g., ['Admin', 'Editor'])
   * @returns true if user has at least one of the roles
   */
  async hasRole(userId: number, roleNames: string[]): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const manager = queryRunner.manager;

      // Get user's role IDs
      const userRoleIds = await this.userRoleRepository.findRoleIdsByUserId(
        userId,
        manager,
      );

      if (userRoleIds.length === 0) {
        return false;
      }

      // Get role IDs for the specified role names
      const roleIds: number[] = [];
      for (const roleName of roleNames) {
        const role = await this.roleRepository.findByName(roleName, manager);
        if (role && !role.deleted_at) {
          roleIds.push(role.id!);
        }
      }

      if (roleIds.length === 0) {
        return false;
      }

      // Check if user has any of the required roles
      return userRoleIds.some((userRoleId) => roleIds.includes(userRoleId));
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check if user has any of the specified permissions
   * Considers both role-based permissions and user-specific permission overrides
   * @param userId User ID
   * @param permissionNames Array of permission names (e.g., ['users:create', 'roles:read'])
   * @returns true if user has at least one of the permissions
   */
  async hasPermission(
    userId: number,
    permissionNames: string[],
  ): Promise<boolean> {

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const manager = queryRunner.manager;

      // Get permission IDs for the specified permission names
      const permissionIds: number[] = [];
      for (const permissionName of permissionNames) {
        const permission = await this.permissionRepository.findByName(
          permissionName,
          manager,
        );

        if (permission && !permission.deleted_at) {
          permissionIds.push(permission.id!);
        }
      }

      if (permissionIds.length === 0) {
        return false;
      }



      // Get user's role IDs
      const userRoleIds = await this.userRoleRepository.findRoleIdsByUserId(
        userId,
        manager,
      );


      // Get permissions from roles
      const rolePermissionIds = new Set<number>();
      for (const roleId of userRoleIds) {
        const rolePermissionIdsForRole =
          await this.rolePermissionRepository.findPermissionIdsByRoleId(
            roleId,
            manager,
          );
        rolePermissionIdsForRole.forEach((id) => rolePermissionIds.add(id));
      }



      // Get user-specific permission overrides
      const userPermissions = await this.userPermissionRepository.findByUserId(
        userId,
        manager,
      );



      // Check user permission overrides (grants and denials)
      const grantedPermissionIds = new Set<number>();
      const deniedPermissionIds = new Set<number>();



      userPermissions.forEach((up) => {
        if (up.is_allowed) {
          grantedPermissionIds.add(up.permission_id);
        } else {
          deniedPermissionIds.add(up.permission_id);
        }
      });

      // Calculate effective permissions:
      // Start with role permissions, add grants, remove denials
      const effectivePermissions = new Set<number>();
      rolePermissionIds.forEach((id) => effectivePermissions.add(id));
      grantedPermissionIds.forEach((id) => effectivePermissions.add(id));
      deniedPermissionIds.forEach((id) => effectivePermissions.delete(id));


      // Check if user has any of the required permissions
      return permissionIds.some((permissionId) =>
        effectivePermissions.has(permissionId),
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check if user has all of the specified permissions
   * @param userId User ID
   * @param permissionNames Array of permission names
   * @returns true if user has all of the permissions
   */
  async hasAllPermissions(
    userId: number,
    permissionNames: string[],
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const manager = queryRunner.manager;

      // Get permission IDs for the specified permission names
      const permissionIds: number[] = [];

      for (const permissionName of permissionNames) {
        const permission = await this.permissionRepository.findByName(
          permissionName,
          manager,
        );
        if (permission && !permission.deleted_at) {
          permissionIds.push(permission.id!);
        }
      }

      if (permissionIds.length === 0) {
        return false;
      }

      // Get user's role IDs
      const userRoleIds = await this.userRoleRepository.findRoleIdsByUserId(
        userId,
        manager,
      );

      // Get permissions from roles
      const rolePermissionIds = new Set<number>();
      for (const roleId of userRoleIds) {
        const rolePermissionIdsForRole =
          await this.rolePermissionRepository.findPermissionIdsByRoleId(
            roleId,
            manager,
          );
        rolePermissionIdsForRole.forEach((id) => rolePermissionIds.add(id));
      }

      // Get user-specific permission overrides
      const userPermissions = await this.userPermissionRepository.findByUserId(
        userId,
        manager,
      );

      // Check user permission overrides (grants and denials)
      const grantedPermissionIds = new Set<number>();
      const deniedPermissionIds = new Set<number>();

      userPermissions.forEach((up) => {
        if (up.is_allowed) {
          grantedPermissionIds.add(up.permission_id);
        } else {
          deniedPermissionIds.add(up.permission_id);
        }
      });

      // Calculate effective permissions
      const effectivePermissions = new Set<number>();
      rolePermissionIds.forEach((id) => effectivePermissions.add(id));
      grantedPermissionIds.forEach((id) => effectivePermissions.add(id));
      deniedPermissionIds.forEach((id) => effectivePermissions.delete(id));



      // Check if user has all of the required permissions
      return permissionIds.every((permissionId) =>
        effectivePermissions.has(permissionId),
      );
    } finally {
      await queryRunner.release();
    }
  }
}
