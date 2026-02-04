import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { UserEntity } from '@/features/user-management/infrastructure/database/entities/user.entity';
import { UserRoleEntity } from '@/features/rbac/infrastructure/database/entities/user-role.entity';
import { getPHDateTime } from '@/core/utils/date.util';
import { PasswordUtil } from '@/core/utils/password.util';
import { ROLES } from '@/core/domain/constants';

/**
 * SeedAdminAccount
 *
 * This seed class creates a default admin account for the application.
 *
 * PURPOSE:
 * Creates an initial administrator user with the Admin role assigned.
 * This allows initial access to the system for setup and configuration.
 *
 * USAGE:
 * This seed creates a default admin user:
 * - Username: admin (configurable via ADMIN_USERNAME env var, default: 'admin')
 * - Email: admin@example.com (configurable via ADMIN_EMAIL env var, default: 'admin@example.com')
 * - Password: admin123 (configurable via ADMIN_PASSWORD env var, default: 'admin123')
 * - Role: Admin (from ROLES.ADMIN constant)
 * - Active: true
 * - Email verified: true
 *
 * NOTE:
 * The seed is idempotent - running it multiple times will not create duplicates.
 * Admin user is checked by username field. If admin exists, it will:
 * - Update email if different
 * - Ensure Admin role is assigned
 * - Log the operation result
 *
 * PERMISSIONS:
 * The Admin role already has all permissions assigned via role-permission links
 * (seeded in SeedRolePermissions). No need for user permission overrides.
 *
 * SECURITY WARNING:
 * Change the default admin password immediately after first login!
 * Consider using environment variables for production deployments.
 */
export class SeedAdminAccount {
  private readonly logger = new Logger(SeedAdminAccount.name);

  constructor(private readonly entityManager: EntityManager) { }

  /**
   * Executes the seed operation to create default admin account.
   *
   * This method:
   * 1. Gets admin credentials from environment variables or uses defaults
   * 2. Checks if admin user already exists (by username)
   * 3. Creates new admin user if it doesn't exist
   * 4. Ensures Admin role is assigned to the admin user
   * 5. Logs the operation result
   *
   * The seed is idempotent - running it multiple times will not create duplicates.
   *
   * NOTE: The Admin role already has all permissions assigned via role-permission links,
   * so no user permission overrides are needed.
   *
   * @param roleMap Map of role names to role IDs (from SeedRoles)
   */
  async run(roleMap: Map<string, number>): Promise<void> {
    // Get admin credentials from environment variables or use defaults
    const adminUsername =
      process.env.ADMIN_USERNAME?.trim().toLowerCase() || 'admin';
    const adminEmail =
      process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'System';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'Administrator';

    // Get Admin role ID from roleMap
    const adminRoleId = roleMap.get(ROLES.ADMIN);
    if (!adminRoleId) {
      this.logger.warn(
        `Admin role (${ROLES.ADMIN}) not found. Skipping admin account creation.`,
      );
      return;
    }

    // Check if admin user already exists (include soft-deleted)
    const existingAdmin = await this.entityManager.findOne(UserEntity, {
      where: { username: adminUsername },
      withDeleted: true,
    });

    let adminUserId: number;

    if (!existingAdmin) {
      // Hash password before creating user
      const hashedPassword = await PasswordUtil.hash(adminPassword);

      // Create new admin user
      const adminUser = this.entityManager.create(UserEntity, {
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        first_name: adminFirstName,
        last_name: adminLastName,
        is_active: true,
        is_email_verified: true,
        is_email_verified_at: getPHDateTime(),
        created_by: 'auto generated',
        created_at: getPHDateTime(),
      });

      const savedAdmin = await this.entityManager.save(adminUser);
      adminUserId = savedAdmin.id;
      this.logger.log(
        `Created admin account: ${adminUsername} (ID: ${adminUserId})`,
      );
    } else {
      adminUserId = existingAdmin.id;

      // Update email if different (in case env var changed)
      if (existingAdmin.email !== adminEmail) {
        existingAdmin.email = adminEmail;
        existingAdmin.updated_by = 'auto generated';
        await this.entityManager.save(existingAdmin);
        this.logger.log(
          `Updated admin email: ${adminUsername} -> ${adminEmail}`,
        );
      }

      // Ensure user is active and email verified
      if (!existingAdmin.is_active || !existingAdmin.is_email_verified) {
        existingAdmin.is_active = true;
        existingAdmin.is_email_verified = true;
        if (!existingAdmin.is_email_verified_at) {
          existingAdmin.is_email_verified_at = getPHDateTime();
        }
        existingAdmin.updated_by = 'auto generated';
        await this.entityManager.save(existingAdmin);
        this.logger.log(`Activated admin account: ${adminUsername}`);
      }

      this.logger.log(`Admin account already exists: ${adminUsername}`);
    }

    // Ensure Admin role is assigned to admin user
    const existingUserRole = await this.entityManager.findOne(UserRoleEntity, {
      where: {
        user_id: adminUserId,
        role_id: adminRoleId,
      },
    });

    if (!existingUserRole) {
      const userRole = this.entityManager.create(UserRoleEntity, {
        user_id: adminUserId,
        role_id: adminRoleId,
        created_by: 'auto generated',
        created_at: getPHDateTime(),
      });

      await this.entityManager.save(userRole);
      this.logger.log(
        `Assigned Admin role to user: ${adminUsername} (ID: ${adminUserId})`,
      );
    } else {
      this.logger.log(`Admin role already assigned to user: ${adminUsername}`);
    }
  }
}
