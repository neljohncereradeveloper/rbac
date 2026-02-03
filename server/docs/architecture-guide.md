# Architecture Guide

Comprehensive guide to the HRIS API architecture, design patterns, and implementation details.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Design Principles](#design-principles)
- [Layer Structure](#layer-structure)
- [Feature Organization](#feature-organization)
- [Domain Layer](#domain-layer)
- [Application Layer](#application-layer)
- [Infrastructure Layer](#infrastructure-layer)
- [Presentation Layer](#presentation-layer)
- [Core Module](#core-module)
- [Dependency Flow](#dependency-flow)
- [Data Flow](#data-flow)
- [Common Patterns](#common-patterns)

## Architecture Overview

The HRIS API follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles, organized by **features** rather than technical layers.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Controllers, DTOs, HTTP, Swagger)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Application Layer                       │
│  (Use Cases, Commands, Orchestration)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                    Domain Layer                          │
│  (Models, Business Logic, Repository Interfaces)       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                Infrastructure Layer                     │
│  (ORM Entities, Repository Implementations, DB)        │
└─────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Domain-Driven Design (DDD)

- **Bounded Contexts**: Each feature is a bounded context
- **Ubiquitous Language**: Code uses domain terminology
- **Rich Domain Models**: Business logic in domain models
- **Aggregates**: Entities grouped by aggregate roots

### 2. Clean Architecture

- **Dependency Rule**: Dependencies point inward (toward domain)
- **Independence**: Domain layer has no external dependencies
- **Testability**: Business logic testable without infrastructure
- **Framework Independence**: Domain doesn't depend on frameworks

### 3. Feature-Based Organization

- **Group by Feature**: Code organized by business feature
- **Self-Contained**: Features are independent modules
- **Clear Boundaries**: Features don't directly depend on each other
- **Shared Code in Core**: Common code extracted to `core/`

## Layer Structure

### Feature Structure

```
features/
  <feature-name>/
    domain/              # Pure business logic
      models/            # Domain entities
      repositories/       # Repository interfaces
      exceptions/         # Domain exceptions
      constants/         # Feature constants
      value-objects/     # Value objects (if any)
    application/         # Use cases and commands
      use-cases/         # Application logic
        <model>/         # Grouped by model
      commands/          # Command interfaces
        <model>/         # Grouped by model
    infrastructure/      # Framework implementations
      database/          # ORM entities and repositories
        entities/        # TypeORM entities
        repositories/    # Repository implementations
      services/          # External services
    presentation/        # Controllers and DTOs
      controllers/      # HTTP controllers
        <model>/         # Grouped by model
      dto/               # Request/response DTOs
        <model>/         # Grouped by model
```

## Feature Organization

### Features Overview

| Feature                | Purpose              | Key Models                                                 |
| ---------------------- | -------------------- | ---------------------------------------------------------- |
| **auth**               | Authentication & JWT | -                                                          |
| **user-management**    | User lifecycle       | User                                                       |
| **rbac**               | Access control       | Role, Permission, UserRole, UserPermission, RolePermission |
| **holiday-management** | Holiday calendar     | Holiday                                                    |

### Feature Independence

Features are designed to be independent:

- Each feature has its own domain models
- Features communicate through shared interfaces (if needed)
- No direct feature-to-feature dependencies
- Common functionality in `core/`

## Domain Layer

### Purpose

The domain layer contains pure business logic with no framework dependencies.

### Components

#### 1. Domain Models

**Location**: `domain/models/`

**Example**: `Role` model

```typescript
export class Role {
  id?: number;
  name: string;
  description: string | null;
  // ... audit fields

  static create(params): Role { ... }
  update(dto): void { ... }
  archive(deleted_by: string): void { ... }
  restore(): void { ... }
  validate(): void { ... }
}
```

**Characteristics**:

- Pure TypeScript classes
- Business logic in methods
- Validation in `validate()` method
- Factory methods (`create()`)
- No framework imports

#### 2. Repository Interfaces

**Location**: `domain/repositories/`

**Example**: `RoleRepository`

```typescript
export interface RoleRepository<Context = unknown> {
  create(
    role: Role,
    context: Context,
    permission_ids?: number[],
  ): Promise<Role>;
  update(id: number, role: Partial<Role>, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Role | null>;
  // ...
}
```

**Characteristics**:

- Operate on domain models (not entities)
- Generic `Context` parameter (for transactions)
- No implementation details

#### 3. Domain Exceptions

**Location**: `domain/exceptions/`

**Example**: `RoleBusinessException`

```typescript
export class RoleBusinessException extends DomainException {
  constructor(message: string, status_code: number = HTTP_STATUS.BAD_REQUEST) {
    super(message, 'ROLE_BUSINESS_EXCEPTION', status_code);
  }
}
```

**Characteristics**:

- Extend `DomainException` from core
- Use `HTTP_STATUS` constants
- Thrown when business rules are violated

#### 4. Domain Constants

**Location**: `domain/constants/`

**Example**: `ROLE_ACTIONS`

```typescript
export const ROLE_ACTIONS = {
  CREATE: 'CREATE_ROLE',
  UPDATE: 'UPDATE_ROLE',
  ARCHIVE: 'ARCHIVE_ROLE',
  // ...
} as const;
```

**Characteristics**:

- Feature-specific constants
- Action constants for logging
- Token constants for DI
- Database model constants

## Application Layer

### Purpose

The application layer orchestrates domain logic and coordinates use cases.

### Components

#### 1. Use Cases

**Location**: `application/use-cases/<model>/`

**Example**: `CreateRoleUseCase`

```typescript
@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(RBAC_TOKENS.ROLE)
    private readonly roleRepository: RoleRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  async execute(command: CreateRoleCommand, requestInfo?: RequestInfo): Promise<Role> {
    return this.transactionHelper.executeTransaction(
      ROLE_ACTIONS.CREATE,
      async (manager) => {
        const role = Role.create({ ... });
        const created = await this.roleRepository.create(role, manager, command.permission_ids);
        // Log activity
        return created;
      }
    );
  }
}
```

**Characteristics**:

- Orchestrate domain operations
- Handle transactions
- Log activities
- Map commands to domain operations
- No business logic (logic in domain)

#### 2. Commands

**Location**: `application/commands/<model>/`

**Example**: `CreateRoleCommand`

```typescript
export interface CreateRoleCommand {
  name: string;
  description?: string | null;
  permission_ids?: number[];
}
```

**Characteristics**:

- Simple TypeScript interfaces
- No validation decorators
- Data transfer objects
- Used by use cases

#### 3. Use Case Patterns

**Standard Patterns**:

- **Create**: Create domain model → Persist → Log → Return
- **Update**: Find → Update domain model → Persist → Log → Return
- **Archive**: Find → Archive domain model → Persist → Log → Return
- **Restore**: Find → Restore domain model → Persist → Log → Return
- **GetById**: Find → Return
- **GetPaginated**: Query → Return paginated results
- **Combobox**: Query → Map to combobox format → Return

## Infrastructure Layer

### Purpose

The infrastructure layer provides framework-specific implementations.

### Components

#### 1. ORM Entities

**Location**: `infrastructure/database/entities/`

**Example**: `RoleEntity`

```typescript
@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  // ... audit fields with TypeORM decorators
}
```

**Characteristics**:

- TypeORM decorators
- Database-specific
- Map to domain models via mappers
- Include audit fields

#### 2. Repository Implementations

**Location**: `infrastructure/database/repositories/`

**Example**: `RoleRepositoryImpl`

```typescript
@Injectable()
export class RoleRepositoryImpl implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(
    role: Role,
    context: EntityManager,
    permission_ids?: number[],
  ): Promise<Role> {
    const entity = RoleMapper.toEntity(role);
    const saved = await context.save(RoleEntity, entity);
    // Handle permission_ids
    return RoleMapper.toDomain(saved);
  }
}
```

**Characteristics**:

- Implement domain repository interfaces
- Use TypeORM for persistence
- Map between entities and domain models
- Handle relationships

#### 3. Mappers

**Location**: `infrastructure/mappers/`

**Purpose**: Convert between domain models and ORM entities

```typescript
export class RoleMapper {
  static toDomain(entity: RoleEntity): Role {
    return new Role({ ... });
  }

  static toEntity(domain: Role): RoleEntity {
    return { ... };
  }
}
```

## Presentation Layer

### Purpose

The presentation layer handles HTTP requests and responses.

### Components

#### 1. Controllers

**Location**: `presentation/controllers/<model>/`

**Example**: `RoleController`

```typescript
@ApiTags('Role')
@Controller('roles')
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    // ...
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(
    @Body() dto: CreateRoleDto,
    @Req() request: Request,
  ): Promise<Role> {
    const command: CreateRoleCommand = {
      name: dto.name,
      description: dto.description ?? null,
      permission_ids: dto.permission_ids,
    };
    const requestInfo = createRequestInfo(request);
    return this.createRoleUseCase.execute(command, requestInfo);
  }
}
```

**Characteristics**:

- Handle HTTP requests
- Map DTOs to commands
- Extract request info
- Call use cases
- Return responses

#### 2. DTOs

**Location**: `presentation/dto/<model>/`

**Example**: `CreateRoleDto`

```typescript
export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Administrator',
    minLength: 1,
    maxLength: 100,
  })
  @RequiredStringValidation({
    field_name: 'Role name',
    min_length: 2,
    max_length: 255,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Full system access',
    maxLength: 1000,
  })
  @OptionalStringValidation({ ... })
  description?: string | null;
}
```

**Characteristics**:

- Classes with validation decorators
- Swagger documentation decorators
- Request/response formatting
- Validation rules

## Core Module

### Purpose

The `core/` module contains shared functionality used across features.

### Structure

```
core/
  domain/
    models/          # Core domain models (ActivityLog, JwtPayload)
    constants/       # Core constants (HTTP_STATUS, PERMISSIONS, ROLES)
    exceptions/      # Core exceptions (DomainException)
    ports/           # Core ports (TransactionPort, JwtTokenPort)
    repositories/    # Core repository interfaces
  application/       # Core application services
  infrastructure/
    database/        # Database configuration, migrations, seeds
    logger/          # Winston logger configuration
    filters/         # Exception filters
    middlewares/     # Request/error logging middleware
    decorators/      # Shared decorators
    adapters/        # Transaction adapter
  utils/             # Shared utilities
```

### Core Components

#### 1. Transaction Management

**Port**: `core/domain/ports/transaction.port.ts`
**Adapter**: `core/infrastructure/adapters/transaction-helper.adapter.ts`

Provides transaction support across features:

```typescript
await transactionHelper.executeTransaction(
  ROLE_ACTIONS.CREATE,
  async (manager) => {
    // All operations use manager for atomicity
  },
);
```

#### 2. Activity Logging

**Model**: `core/domain/models/activity-log.model.ts`
**Repository**: `core/domain/repositories/activity-log.repository.ts`

Logs all operations for audit trail:

```typescript
const log = ActivityLog.create({
  action: ROLE_ACTIONS.CREATE,
  entity: RBAC_DATABASE_MODELS.ROLES,
  details: JSON.stringify({ ... }),
  request_info: requestInfo,
});
await activityLogRepository.create(log, manager);
```

#### 3. Exception Handling

**Filters**: `core/infrastructure/filters/`

- `DomainExceptionFilter`: Handles domain exceptions
- `JwtExceptionFilter`: Handles JWT errors

#### 4. Request Logging

**Middlewares**: `core/infrastructure/middlewares/`

- `RequestLoggerMiddleware`: Logs all requests
- `ErrorLoggerMiddleware`: Logs errors

## Dependency Flow

### Dependency Rule

```
Presentation → Application → Domain ← Infrastructure
```

**Key Points**:

- Domain has no dependencies (except core for exceptions)
- Application depends on Domain
- Infrastructure depends on Domain
- Presentation depends on Application and Domain
- Core can be used by any layer

### Dependency Injection

Uses NestJS dependency injection with tokens:

```typescript
// Feature-specific tokens
@Inject(RBAC_TOKENS.ROLE)
private readonly roleRepository: RoleRepository

// Core tokens
@Inject(TOKENS_CORE.TRANSACTIONPORT)
private readonly transactionHelper: TransactionPort
```

## Data Flow

### Request Flow

```
1. HTTP Request
   ↓
2. Controller (Presentation)
   - Extract DTO
   - Map DTO → Command
   - Extract RequestInfo
   ↓
3. Use Case (Application)
   - Start transaction
   - Call domain methods
   - Call repository
   - Log activity
   ↓
4. Domain Model (Domain)
   - Validate business rules
   - Execute business logic
   ↓
5. Repository (Infrastructure)
   - Map domain → entity
   - Execute database query
   - Map entity → domain
   ↓
6. Database
   - Persist data
   ↓
7. Response flows back up
```

### Example: Creating a Role

```
1. POST /api/v1/roles
   Body: { "name": "Admin", ... }
   ↓
2. RoleController.create()
   - Receives CreateRoleDto
   - Maps to CreateRoleCommand
   - Extracts RequestInfo
   ↓
3. CreateRoleUseCase.execute()
   - Starts transaction
   - Calls Role.create() (domain)
   - Calls roleRepository.create() (infrastructure)
   - Logs activity
   ↓
4. Role.create() (Domain)
   - Validates name, description
   - Creates Role instance
   ↓
5. RoleRepositoryImpl.create() (Infrastructure)
   - Maps Role → RoleEntity
   - Saves to database
   - Handles permission_ids
   - Maps RoleEntity → Role
   ↓
6. Returns Role to controller
   ↓
7. Controller returns Role as JSON response
```

## Common Patterns

### 1. Use Case Pattern

All use cases follow this pattern:

```typescript
@Injectable()
export class CreateModelUseCase {
  constructor(
    @Inject(TOKENS_CORE.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(FEATURE_TOKENS.MODEL)
    private readonly modelRepository: ModelRepository,
    @Inject(TOKENS_CORE.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  async execute(command: CreateModelCommand, requestInfo?: RequestInfo): Promise<Model> {
    return this.transactionHelper.executeTransaction(
      MODEL_ACTIONS.CREATE,
      async (manager) => {
        // 1. Create domain model
        const model = Model.create({ ... });

        // 2. Persist
        const created = await this.modelRepository.create(model, manager);

        // 3. Log
        const log = ActivityLog.create({ ... });
        await this.activityLogRepository.create(log, manager);

        // 4. Return
        return created;
      }
    );
  }
}
```

### 2. Controller Pattern

All controllers follow this pattern:

```typescript
@ApiTags('Model')
@Controller('models')
export class ModelController {
  constructor(
    private readonly createModelUseCase: CreateModelUseCase,
    // ...
  ) {}

  @Version('1')
  @Post()
  @ApiOperation({ summary: 'Create a new model' })
  @ApiBody({ type: CreateModelDto })
  @ApiResponse({ status: 201, description: 'Model created successfully' })
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() dto: CreateModelDto,
    @Req() request: Request,
  ): Promise<Model> {
    const requestInfo = createRequestInfo(request);
    const command: CreateModelCommand = {
      // Map DTO to command
    };
    return this.createModelUseCase.execute(command, requestInfo);
  }
}
```

### 3. Domain Model Pattern

All domain models follow this pattern:

```typescript
export class Model {
  // Properties (id, business fields, audit fields)
  id?: number;
  name: string;
  // ... audit fields

  // Constructor
  constructor(dto: { ... }) { ... }

  // Static factory
  static create(params: { ... }): Model {
    const model = new Model({ ... });
    model.validate();
    return model;
  }

  // Update method
  update(dto: { ... }): void {
    // Validate archived state
    // Validate new state
    // Apply changes
  }

  // Archive method
  archive(deleted_by: string): void {
    // Check if already archived
    // Set deleted_at and deleted_by
  }

  // Restore method
  restore(): void {
    // Check if archived
    // Clear deleted_at and deleted_by
  }

  // Validate method
  validate(): void {
    // Business rule validation
    // Throw ModelBusinessException on violation
  }
}
```

### 4. Repository Pattern

All repositories follow this pattern:

```typescript
// Domain interface
export interface ModelRepository<Context = unknown> {
  create(model: Model, context: Context): Promise<Model>;
  update(id: number, model: Partial<Model>, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Model | null>;
  // ...
}

// Infrastructure implementation
@Injectable()
export class ModelRepositoryImpl implements ModelRepository {
  constructor(
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
  ) {}

  async create(model: Model, context: EntityManager): Promise<Model> {
    const entity = ModelMapper.toEntity(model);
    const saved = await context.save(ModelEntity, entity);
    return ModelMapper.toDomain(saved);
  }
  // ...
}
```

## Best Practices

### 1. Domain Layer

- ✅ Keep domain pure (no framework imports)
- ✅ Put business logic in domain models
- ✅ Use domain exceptions for business rule violations
- ✅ Keep repository interfaces in domain
- ❌ Don't put infrastructure code in domain
- ❌ Don't import from application/infrastructure

### 2. Application Layer

- ✅ Orchestrate domain operations
- ✅ Handle transactions
- ✅ Log activities
- ✅ Map commands to domain operations
- ❌ Don't put business logic in use cases
- ❌ Don't access infrastructure directly (use repositories)

### 3. Infrastructure Layer

- ✅ Implement domain interfaces
- ✅ Handle framework-specific code
- ✅ Map between entities and domain models
- ✅ Keep database-specific logic here
- ❌ Don't expose infrastructure details to application

### 4. Presentation Layer

- ✅ Handle HTTP concerns
- ✅ Validate input (DTOs)
- ✅ Map DTOs to commands
- ✅ Extract request info
- ❌ Don't put business logic in controllers
- ❌ Don't access repositories directly

## Related Documentation

- **Setup Guide**: `docs/setup-guide.md`
- **API Usage Guide**: `docs/api-usage-guide.md`
- **RBAC Guide**: `docs/rbac.md`
- **Permissions Guide**: `docs/permissions-management.md`
