import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { Logger } from '@nestjs/common';
import { allEntities } from '../entities';
import { SeedPermissions } from './create-default-permissions.seed';
import { SeedRoles } from './create-default-roles.seed';
import { SeedRolePermissions } from './create-default-role-permissions.seed';
import { SeedAdminAccount } from './create-default-admin.seed';

// Load environment variables from .env
dotenvConfig();

// Define the standalone DataSource configuration
const data_source = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  // host: process.env.DB_HOST || 'localhost',
  // port: Number(process.env.DB_PORT) || 5432,
  // username: process.env.DB_USERNAME || 'postgres',
  // password: process.env.DB_PASSWORD || 'postgres',
  // database: process.env.DB_DATABASE || 'hris',
  entities: allEntities,
  synchronize: false, // Avoid sync in production
  logging: process.env.DB_LOGGING === 'true',
});

class SeedRunner {
  private readonly logger = new Logger('SeedRunner');

  constructor(private readonly data_source: DataSource) {}

  async run() {
    // Initialize database connection
    await this.data_source.initialize();
    this.logger.debug('Seeder Database connected successfully.');

    // Start a query runner for manual transaction control
    const query_runner = this.data_source.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      // Execute all seeds within the transaction
      // Order matters: permissions first, then roles, then role-permissions

      // 1. Seed permissions
      const permissions_seeder = new SeedPermissions(query_runner.manager);
      const permissionMap = await permissions_seeder.run();
      this.logger.log('Permissions seeded');

      // 2. Seed roles
      const roles_seeder = new SeedRoles(query_runner.manager);
      const roleMap = await roles_seeder.run();
      this.logger.log('Roles seeded');

      // 3. Seed role-permissions (links roles to permissions)
      const role_permissions_seeder = new SeedRolePermissions(
        query_runner.manager,
      );
      await role_permissions_seeder.run(roleMap, permissionMap);
      this.logger.log('Role-permissions seeded');

      // 4. Seed admin account (creates default admin user with Admin role)
      // Note: Admin role already has all permissions via role-permission links
      const admin_seeder = new SeedAdminAccount(query_runner.manager);
      await admin_seeder.run(roleMap);
      this.logger.log('Admin account seeded');

      // Commit the transaction if all seeds succeed
      await query_runner.commitTransaction();
      this.logger.log('All seeds executed successfully.');
    } catch (error) {
      // Rollback transaction in case of error
      await query_runner.rollbackTransaction();
      this.logger.error(
        'Error during seeding, transaction rolled back:',
        error,
      );
      throw error;
    } finally {
      // Release the query runner and close the database connection
      await query_runner.release();
      await this.data_source.destroy();
      this.logger.debug('Seeder Database closed successfully.');
    }
  }
}

// Execute the seed runner
new SeedRunner(data_source).run();
