# HRIS API Server

Human Resource Information System API built with NestJS, following Domain-Driven Design (DDD) principles and feature-based architecture.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Overview

This is a RESTful API server built with NestJS that provides:

- **Authentication & Authorization**: JWT-based authentication with Role-Based Access Control (RBAC)
- **User Management**: Complete user lifecycle management
- **RBAC System**: System-defined roles and permissions with user-level permission management
  - Roles and permissions are statically defined (managed via seeders only)
  - User permissions can be granted or denied directly on users (overrides role permissions)
- **Holiday Management**: Holiday calendar management

The application follows Domain-Driven Design principles with a clean architecture organized by features.

## Features

### 1. Authentication (`auth`)

**Purpose**: User authentication and JWT token management

**Endpoints**:

- `POST /api/v1/auth/login` - Authenticate user and get JWT token

**Key Components**:

- JWT token generation and validation
- Password hashing with bcrypt
- Public route decorator for unauthenticated endpoints

### 2. User Management (`user-management`)

**Purpose**: Complete user account lifecycle management

**Endpoints**:

- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users` - Get paginated list of users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user information
- `POST /api/v1/users/:id/change-password` - Change user password
- `POST /api/v1/users/:id/verify-email` - Verify user email
- `DELETE /api/v1/users/:id/archive` - Archive a user (soft delete)
- `PATCH /api/v1/users/:id/restore` - Restore an archived user
- `GET /api/v1/users/combobox/list` - Get users combobox list

**Key Features**:

- User CRUD operations
- Email verification
- Password management
- Soft delete (archive/restore)
- Pagination and search
- Combobox data for dropdowns

### 3. RBAC - Role-Based Access Control (`rbac`)

**Purpose**: Manage roles, permissions, and access control

**Important**: Roles and permissions are **system-defined** and cannot be modified through the API. They are managed exclusively via database seeders to ensure consistency and prevent breaking authorization checks.

#### 3.1 Roles (`Role`)

**System-Defined Roles**: Admin, Editor, Viewer

**Note**: Roles are statically defined and managed via seeders only. Modifying or archiving them would break authorization checks since role names are hardcoded in controllers.

**Endpoints**:

- `GET /api/v1/roles` - Get all roles (no pagination, no filtering)

#### 3.2 Permissions (`Permission`)

**Note**: Permissions are statically defined and managed via seeders only. Modifying or archiving them would break authorization checks.

**Endpoints**:

- `GET /api/v1/permissions` - Get all permissions (no pagination, no filtering)

#### 3.3 Role-Permission Relationships (`Role-Permission`)

**Note**: Role-permission assignments are **managed via seeders only**. The relationship between roles and permissions is statically defined and cannot be modified through the API.

**Endpoints**:

- `GET /api/v1/roles/:roleId/permissions` - Get permissions assigned to a role (read-only)

#### 3.4 User-Role Relationships (`User-Role`)

**Endpoints**:

- `GET /api/v1/users/:userId/roles` - Get roles assigned to a user
- `POST /api/v1/users/:userId/roles` - Assign roles to a user (use `replace: true` to replace all existing roles)

**Note**: To remove roles from a user, use the `POST` endpoint with `replace: true` and provide only the roles you want to keep.

#### 3.5 User-Permission Overrides (`User-Permission`)

**Important**: To modify a user's permissions, **grant or deny permissions directly on the user**, not on roles. User permission overrides take precedence over role-based permissions.

**How It Works**:

- Users inherit permissions from their assigned roles
- User permission overrides can **grant** permissions (even if the role doesn't have them)
- User permission overrides can **deny** permissions (even if the role grants them)
- User permission overrides take precedence over role permissions

**Endpoints**:

- `GET /api/v1/users/:userId/permissions` - Get permission overrides for a user
- `POST /api/v1/users/:userId/permissions/grant` - **Grant permissions directly to a user** (overrides role permissions)
- `POST /api/v1/users/:userId/permissions/deny` - **Deny permissions directly to a user** (overrides role permissions)
- `DELETE /api/v1/users/:userId/permissions` - Remove permission overrides from a user

**Key Features**:

- Hierarchical permission system (roles → permissions)
- **User-level permission management**: Grant or deny permissions directly on users
- Permission inheritance through roles with user-level overrides
- Complete audit trail via activity logs

#### RBAC System Architecture

**System-Defined Components** (Managed via Seeders Only):

1. **Roles**: Three predefined roles (Admin, Editor, Viewer) with fixed permission sets
2. **Permissions**: All permissions are statically defined and cannot be modified
3. **Role-Permission Assignments**: Relationships between roles and permissions are fixed

**Dynamic Components** (Managed via API):

1. **User-Role Assignments**: Assign roles to users dynamically
   - Use `POST /api/v1/users/:userId/roles` with `replace: true` to replace all roles
2. **User-Permission Overrides**: Grant or deny specific permissions directly on users

**Permission Resolution Logic**:

1. User inherits permissions from assigned roles
2. User permission overrides are applied:
   - **Grant**: User gets permission even if role doesn't have it
   - **Deny**: User is denied permission even if role grants it
3. User permission overrides take precedence over role permissions

**Best Practice**: To modify a user's access, **grant or deny permissions directly on the user** using the User-Permission endpoints, rather than modifying role-permission assignments (which are fixed).

#### 3.6 Data Managed by Seeders

**Important**: The following data is **system-defined** and must be managed exclusively through database seeders. These components cannot be modified through the API to ensure consistency and prevent breaking authorization checks.

**Data Managed via Seeders**:

1. **Roles**:
   - Three predefined roles: Admin, Editor, Viewer
   - Role names, descriptions, and properties
   - Role creation, update, archive, and restore operations

2. **Permissions**:
   - All permission definitions (name, resource, action, description)
   - Permission creation, update, archive, and restore operations

3. **Role-Permission Assignments**:
   - Relationships between roles and permissions
   - Which permissions each role has access to

**Why Seeders Only?**:

- **Consistency**: Role and permission names are hardcoded in controllers and authorization guards. Modifying them through the API would break authorization checks.
- **Security**: Prevents accidental modification of critical authorization data
- **Audit Trail**: Seeders provide a clear, version-controlled history of system-defined data
- **Deployment**: Ensures consistent data across all environments (development, staging, production)

**How to Modify Seeder Data**:

1. Locate the seeder files in `src/core/infrastructure/database/seed/`
2. Modify the seeder data as needed
3. Run the seeders: `yarn seed:run`
4. Commit the seeder changes to version control

**Seeder Files**:

- `create-default-roles.seed.ts` - Creates Admin, Editor, Viewer roles
- `create-default-permissions.seed.ts` - Creates all system permissions
- `create-default-role-permissions.seed.ts` - Assigns permissions to roles

### 4. Holiday Management (`holiday-management`)

**Purpose**: Manage holiday calendar and recurring holidays

**Endpoints**:

- `POST /api/v1/holidays` - Create a new holiday
- `GET /api/v1/holidays` - Get paginated list of holidays
- `GET /api/v1/holidays/:id` - Get holiday by ID
- `PUT /api/v1/holidays/:id` - Update holiday information
- `DELETE /api/v1/holidays/:id/archive` - Archive a holiday
- `PATCH /api/v1/holidays/:id/restore` - Restore an archived holiday
- `GET /api/v1/holidays/combobox` - Get holidays combobox list

**Key Features**:

- Holiday CRUD operations
- Recurring holiday support
- Soft delete (archive/restore)
- Pagination and search

## Architecture

### Design Principles

- **Domain-Driven Design (DDD)**: Business logic encapsulated in domain models
- **Feature-Based Structure**: Code organized by feature/bounded context
- **Clean Architecture**: Separation of concerns across layers
- **Dependency Inversion**: Domain layer independent of infrastructure

### Layer Structure

```
features/
  <feature-name>/
    domain/          # Pure business logic (no framework dependencies)
      models/        # Domain entities
      repositories/  # Repository interfaces
      exceptions/    # Domain exceptions
      constants/     # Feature constants
    application/     # Use cases and commands
      use-cases/     # Application logic
      commands/      # Command interfaces
    infrastructure/  # Framework implementations
      database/      # ORM entities and repositories
      services/      # External service integrations
    presentation/    # Controllers and DTOs
      controllers/   # HTTP endpoints
      dto/           # Request/response DTOs
```

### Core Components

- **Core Module**: Shared utilities, domain models, and infrastructure
- **Transaction Management**: Database transactions via TransactionPort
- **Activity Logging**: Audit trail for all operations
- **Exception Handling**: Global exception filters
- **Request Logging**: Winston-based request/error logging

## Prerequisites

- **Node.js**: v18.x or higher
- **Yarn**: v1.22.x or higher (package manager)
- **PostgreSQL**: v12.x or higher
- **TypeScript**: v5.x

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rbac/server
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Copy `.env` file and configure environment variables (see [Environment Variables](#environment-variables) section):

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database Setup

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE rbac;
```

### 5. Run Migrations

```bash
# Build the project first
yarn build

# Run migrations
yarn migration:run
```

### 6. Seed Default Data

Create default admin user and initial data:

```bash
yarn seed:run
```

### 7. Start Development Server

```bash
yarn start:dev
```

The API will be available at `http://localhost:3220` (or your configured PORT).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application Environment
NODE_ENV=development
PORT=3220
SERVER=localhost
CORS_ORIGINS=*

# Database Configuration
DB_URL=postgresql://username:password@localhost:5432/rbac

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=8H

# Admin Account (for seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
```

### Environment Variable Descriptions

| Variable         | Description                                      | Required | Default     |
| ---------------- | ------------------------------------------------ | -------- | ----------- |
| `NODE_ENV`       | Application environment (development/production) | No       | development |
| `PORT`           | Server port                                      | No       | 3000        |
| `SERVER`         | Server hostname                                  | No       | localhost   |
| `CORS_ORIGINS`   | Comma-separated list of allowed CORS origins     | No       | \*          |
| `DB_URL`         | PostgreSQL connection string                     | Yes      | -           |
| `JWT_SECRET`     | Secret key for JWT token signing                 | Yes      | -           |
| `JWT_EXPIRATION` | JWT token expiration time                        | No       | 1d          |
| `ADMIN_*`        | Default admin account credentials for seeding    | No       | -           |

## API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3220/api/docs
```

The Swagger UI provides:

- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication support (JWT Bearer token)

### API Base URL

All API endpoints are prefixed with `/api/v1`:

```
Base URL: http://localhost:3220/api/v1
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

**Public Endpoints** (no authentication required):

- `POST /api/v1/auth/login`

### API Versioning

The API uses URI versioning:

- Current version: `v1`
- All endpoints: `/api/v1/{resource}`

### Pagination

Most list endpoints support pagination via query parameters:

```
GET /api/v1/users?page=1&limit=10&term=search&is_archived=false
```

**Query Parameters**:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `term` (string): Search term (optional)
- `is_archived` (string): Filter archived records ('true'/'false')

**Response Format**:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_records": 100,
    "total_pages": 10,
    "next_page": 2,
    "previous_page": null
  }
}
```

**Note**: Roles and Permissions endpoints do **not** support pagination. They return all records in a single response:

- `GET /api/v1/roles` - Returns all roles (no pagination)
- `GET /api/v1/permissions` - Returns all permissions (no pagination)

## Development

### Project Scripts

```bash
# Development
yarn start:dev          # Start development server with hot reload
yarn start:debug        # Start with debugging enabled

# Production
yarn build              # Build for production
yarn start:prod         # Start production server

# Code Quality
yarn lint               # Run ESLint
yarn format             # Format code with Prettier

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:cov           # Run tests with coverage
yarn test:e2e           # Run end-to-end tests

# Database
yarn migration:create  # Create a new migration
yarn migration:generate # Generate migration from entities
yarn migration:run      # Run pending migrations
yarn migration:revert   # Revert last migration
yarn migration:show     # Show migration status
yarn seed:run           # Run database seeds
```

### Code Style

The project follows:

- **File naming**: kebab-case (e.g., `user-repository.ts`)
- **Folder naming**: kebab-case (e.g., `user-management/`)
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with Prettier integration

### Adding a New Feature

1. Create feature folder structure:

   ```
   features/
     <feature-name>/
       domain/
       application/
       infrastructure/
       presentation/
   ```

2. Follow the patterns in existing features (see `rbac` or `user-management`)

3. Register the feature module in `app.module.ts`

4. Add Swagger tags in `main.ts`

5. Create controllers with proper Swagger decorators

## Database Migrations

### Creating Migrations

```bash
# Create empty migration
yarn migration:create src/core/infrastructure/database/migrations/MigrationName

# Generate migration from entity changes
yarn migration:generate src/core/infrastructure/database/migrations/MigrationName
```

### Running Migrations

```bash
# Run pending migrations
yarn migration:run

# Revert last migration
yarn migration:revert

# Show migration status
yarn migration:show
```

## Testing

### Unit Tests

```bash
yarn test
```

### E2E Tests

```bash
yarn test:e2e
```

### Test Coverage

```bash
yarn test:cov
```

## Project Structure

```
server/
├── src/
│   ├── core/                    # Shared/core functionality
│   │   ├── domain/              # Core domain models, ports, constants
│   │   ├── application/         # Core application services
│   │   ├── infrastructure/      # Core infrastructure (DB, logging, etc.)
│   │   └── utils/              # Shared utilities
│   ├── features/                # Feature modules
│   │   ├── auth/               # Authentication feature
│   │   ├── user-management/    # User management feature
│   │   ├── rbac/               # RBAC feature
│   │   └── holiday-management/ # Holiday management feature
│   ├── app.module.ts           # Root application module
│   └── main.ts                 # Application entry point
├── test/                        # E2E tests
├── docs/                        # Additional documentation
├── api/                         # HTTP request files for testing
├── .env                         # Environment variables
├── package.json                 # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Key Technologies

- **NestJS**: Progressive Node.js framework
- **TypeORM**: Object-Relational Mapping
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **Swagger/OpenAPI**: API documentation
- **Winston**: Logging library
- **class-validator**: Validation decorators
- **class-transformer**: Object transformation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password encryption
- **RBAC**: Role-Based Access Control for authorization
- **Input Validation**: Request validation via class-validator
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Global Guards**: JWT, Roles, and Permissions guards
- **Soft Delete**: Archive instead of hard delete for data retention

## License

UNLICENSED

## Documentation

Additional detailed documentation is available in the `docs/` folder:

- **[Setup Guide](docs/setup-guide.md)** - Complete setup instructions from scratch
- **[API Usage Guide](docs/api-usage-guide.md)** - How to use the API endpoints
- **[Architecture Guide](docs/architecture-guide.md)** - Detailed architecture and design patterns
- **[Development Guide](docs/development-guide.md)** - Guide for developers
- **[Deployment Guide](docs/deployment-guide.md)** - Production deployment instructions
- **[Permissions Management](docs/permissions-management.md)** - Managing permissions (seeders vs APIs)
- **[Permissions Quick Guide](docs/permissions-quick-guide.md)** - Quick guide for permission management

## Support

For issues and questions, please refer to the project documentation in the `docs/` folder or create an issue in the repository.
