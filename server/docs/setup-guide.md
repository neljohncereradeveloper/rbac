# Setup Guide

Complete step-by-step guide for setting up the HRIS API server from scratch.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running Migrations](#running-migrations)
- [Seeding Data](#seeding-data)
- [Starting the Server](#starting-the-server)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Software       | Version           | Installation                                     |
| -------------- | ----------------- | ------------------------------------------------ |
| **Node.js**    | v18.x or higher   | [Download](https://nodejs.org/)                  |
| **Yarn**       | v1.22.x or higher | `npm install -g yarn`                            |
| **PostgreSQL** | v12.x or higher   | [Download](https://www.postgresql.org/download/) |
| **Git**        | Latest            | [Download](https://git-scm.com/)                 |

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check Yarn version
yarn --version  # Should be v1.22.x or higher

# Check PostgreSQL version
psql --version  # Should be v12.x or higher

# Check Git version
git --version
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rbac/server
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all project dependencies defined in `package.json`.

### 3. Verify Installation

```bash
# Check if NestJS CLI is available
yarn nest --version

# List available scripts
yarn run
```

## Database Setup

### 1. Create PostgreSQL Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rbac;

# Verify database creation
\l
```

### 2. Verify Database Connection

Update your `.env` file with the correct database connection string (see [Environment Configuration](#environment-configuration)).

Test the connection:

```bash
# Using psql
psql -U postgres -d rbac

# If connection successful, you'll see:
# rbac=#
```

## Environment Configuration

### 1. Create Environment File

Copy the example environment file (if available) or create a new `.env` file:

```bash
# If .env.example exists
cp .env.example .env

# Or create new .env file
touch .env
```

### 2. Configure Environment Variables

Edit `.env` with your configuration:

```env
# Application Environment
NODE_ENV=development
PORT=3220
SERVER=localhost
CORS_ORIGINS=*

# Database Configuration
DB_URL=postgresql://username:password@localhost:5432/rbac

# JWT Configuration
JWT_SECRET=your-secret-key-here-minimum-32-characters
JWT_EXPIRATION=8H

# Admin Account (for seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
```

### 3. Generate JWT Secret

For production, generate a secure random secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

**Important**: Never commit `.env` files to version control. They are already in `.gitignore`.

## Running Migrations

### 1. Build the Project

Migrations require the compiled TypeScript code:

```bash
yarn build
```

### 2. Check Migration Status

```bash
yarn migration:show
```

This shows which migrations have been run and which are pending.

### 3. Run Migrations

```bash
yarn migration:run
```

This will:

- Create all database tables
- Set up indexes and constraints
- Create foreign key relationships

### 4. Verify Migrations

```bash
# Check migration status again
yarn migration:show

# Or check database tables
psql -U postgres -d rbac -c "\dt"
```

Expected tables:

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `user_permissions`
- `holidays`
- `activity_logs`

## Seeding Data

### 1. Run Seeders

Seeders create default data (roles, permissions, admin user):

```bash
yarn seed:run
```

This will:

- Create default roles (Admin, Editor, Viewer)
- Create default permissions for all features
- Link roles to permissions
- Create default admin user

### 2. Verify Seeded Data

```bash
# Connect to database
psql -U postgres -d rbac

# Check roles
SELECT id, name, description FROM roles;

# Check permissions count
SELECT COUNT(*) FROM permissions;

# Check admin user
SELECT id, username, email FROM users WHERE username = 'admin';

# Check role-permission links
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;
```

Expected results:

- **3 roles**: Admin, Editor, Viewer
- **~40+ permissions**: For roles, permissions, users, holidays, etc.
- **1 admin user**: With username from `ADMIN_USERNAME`
- **Role-permission links**: Admin has all permissions, Editor has subset, Viewer has read-only

## Starting the Server

### Development Mode

```bash
yarn start:dev
```

This starts the server with:

- Hot reload (auto-restart on file changes)
- Detailed error messages
- Source maps for debugging

### Production Mode

```bash
# Build first
yarn build

# Start production server
yarn start:prod
```

### Debug Mode

```bash
yarn start:debug
```

This enables Node.js debugging. Connect your debugger to `localhost:9229`.

## Verification

### 1. Check Server Status

Once started, you should see:

```
[Nest] LOG [Bootstrap] Application is running on: http://localhost:3220 : localhost
[Nest] LOG [Bootstrap] Swagger documentation available at: http://localhost:3220/api/docs
```

### 2. Test Health Endpoint

```bash
# Using curl
curl http://localhost:3220/api/v1/health

# Or using browser
# Navigate to: http://localhost:3220/api/v1/health
```

### 3. Test Login Endpoint

```bash
curl -X POST http://localhost:3220/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin",
    "password": "admin123"
  }'
```

Expected response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    ...
  }
}
```

### 4. Access Swagger Documentation

Open in browser:

```
http://localhost:3220/api/docs
```

You should see the Swagger UI with all API endpoints documented.

## Troubleshooting

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3220`

**Solution**:

```bash
# Find process using port
netstat -ano | findstr :3220  # Windows
lsof -i :3220                 # macOS/Linux

# Kill the process or change PORT in .env
```

### Issue: Database Connection Failed

**Error**: `ECONNREFUSED` or `password authentication failed`

**Solutions**:

1. Verify PostgreSQL is running:

   ```bash
   # Windows
   services.msc  # Check PostgreSQL service

   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Check database credentials in `.env`
3. Verify database exists:

   ```sql
   SELECT datname FROM pg_database WHERE datname = 'rbac';
   ```

4. Test connection manually:
   ```bash
   psql -U postgres -d rbac
   ```

### Issue: Migration Errors

**Error**: `Migration failed` or `Table already exists`

**Solutions**:

1. Check migration status:

   ```bash
   yarn migration:show
   ```

2. If migrations are partially applied, revert and re-run:

   ```bash
   yarn migration:revert
   yarn migration:run
   ```

3. If database is corrupted, drop and recreate:
   ```sql
   DROP DATABASE rbac;
   CREATE DATABASE rbac;
   ```
   Then run migrations again.

### Issue: Seeder Errors

**Error**: `Permission already exists` or `Role already exists`

**Solution**: This is normal - seeders are idempotent. They check for existing data before creating. If you see these messages, the data already exists.

To reset and re-seed:

```sql
-- WARNING: This deletes all data!
TRUNCATE TABLE user_permissions CASCADE;
TRUNCATE TABLE role_permissions CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE permissions CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE users CASCADE;
```

Then run seeders again:

```bash
yarn seed:run
```

### Issue: JWT Secret Not Configured

**Error**: `JWT_SECRET is not configured`

**Solution**: Ensure `JWT_SECRET` is set in `.env` file:

```env
JWT_SECRET=your-secret-key-here-minimum-32-characters
```

### Issue: Module Not Found

**Error**: `Cannot find module` or `Module not found`

**Solutions**:

1. Reinstall dependencies:

   ```bash
   rm -rf node_modules yarn.lock
   yarn install
   ```

2. Rebuild the project:

   ```bash
   yarn build
   ```

3. Check TypeScript paths in `tsconfig.json`

### Issue: Swagger Not Loading

**Error**: Swagger UI shows errors or doesn't load

**Solutions**:

1. Verify server is running
2. Check browser console for errors
3. Clear browser cache
4. Try accessing directly: `http://localhost:3220/api/docs`

## Next Steps

After successful setup:

1. ✅ **Explore Swagger UI**: `http://localhost:3220/api/docs`
2. ✅ **Test Authentication**: Login and get JWT token
3. ✅ **Test Protected Endpoints**: Use JWT token to access protected routes
4. ✅ **Review API Examples**: Check `api/*.http` files for request examples
5. ✅ **Read Documentation**: Review `docs/` folder for detailed guides

## Additional Resources

- **API Documentation**: `http://localhost:3220/api/docs`
- **RBAC Guide**: `docs/rbac.md`
- **Permissions Guide**: `docs/permissions-management.md`
- **Quick Reference**: `docs/rbac-quick-reference.md`

## Support

If you encounter issues not covered here:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review application logs (check console output)
3. Check database logs (PostgreSQL logs)
4. Review error messages carefully
5. Check GitHub issues or create a new one
