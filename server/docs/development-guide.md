# Development Guide

Guide for developers working on the HRIS API, including coding standards, workflows, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Coding Standards](#coding-standards)
- [Adding a New Feature](#adding-a-new-feature)
- [Adding a New Endpoint](#adding-a-new-endpoint)
- [Database Changes](#database-changes)
- [Testing](#testing)
- [Code Review Checklist](#code-review-checklist)
- [Git Workflow](#git-workflow)

## Getting Started

### 1. Setup Development Environment

Follow the [Setup Guide](setup-guide.md) to set up your development environment.

### 2. Development Server

Start the development server with hot reload:

```bash
yarn start:dev
```

The server will automatically restart when you make changes.

### 3. Code Formatting

Format code before committing:

```bash
yarn format
```

### 4. Linting

Check and fix linting issues:

```bash
yarn lint
```

## Coding Standards

### File Naming

- **Files**: kebab-case (e.g., `user-repository.ts`, `create-role.use-case.ts`)
- **Folders**: kebab-case (e.g., `user-management/`, `use-cases/`)
- **Test files**: `*.spec.ts` (e.g., `user-repository.spec.ts`)

### Code Style

- **Variables/Functions**: camelCase (TypeScript convention)
- **Classes**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE (if used for constants)
- **Interfaces/Types**: PascalCase

### Import Order

1. External libraries (`@nestjs/*`, `express`, etc.)
2. Core module (`@/core/*`)
3. Feature modules (`@/features/*`)
4. Relative imports (`../`, `./`)

**Example**:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'express';
import { TOKENS_CORE } from '@/core/domain/constants';
import { TransactionPort } from '@/core/domain/ports';
import { RoleRepository } from '@/features/rbac/domain/repositories';
import { CreateRoleCommand } from '../commands/role/create-role.command';
```

### Code Organization

- **One class per file**: Each file contains one main export
- **Barrel exports**: Use `index.ts` files for exports
- **Group related code**: Keep related functionality together

## Adding a New Feature

### Step 1: Create Feature Structure

Create the feature folder structure:

```bash
features/
  <feature-name>/
    domain/
      models/
      repositories/
      exceptions/
      constants/
    application/
      use-cases/
        <model>/
      commands/
        <model>/
    infrastructure/
      database/
        entities/
        repositories/
    presentation/
      controllers/
        <model>/
      dto/
        <model>/
```

### Step 2: Define Domain Model

**File**: `domain/models/<model>.model.ts`

```typescript
import { HTTP_STATUS } from '@/core/domain/constants';
import { ModelBusinessException } from '../exceptions';

export class Model {
  id?: number;
  name: string;
  // ... other fields

  constructor(dto: { ... }) { ... }

  static create(params: { ... }): Model {
    const model = new Model({ ... });
    model.validate();
    return model;
  }

  update(dto: { ... }): void { ... }
  archive(deleted_by: string): void { ... }
  restore(): void { ... }
  validate(): void { ... }
}
```

### Step 3: Define Repository Interface

**File**: `domain/repositories/<model>.repository.ts`

```typescript
export interface ModelRepository<Context = unknown> {
  create(model: Model, context: Context): Promise<Model>;
  update(id: number, model: Partial<Model>, context: Context): Promise<boolean>;
  findById(id: number, context: Context): Promise<Model | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Model>>;
  combobox(context: Context): Promise<Model[]>;
}
```

### Step 4: Create Use Cases

Follow the patterns in existing features:

- `create.use-case.ts`
- `update.use-case.ts`
- `archive.use-case.ts`
- `restore.use-case.ts`
- `get-by-id.use-case.ts`
- `get-paginated.use-case.ts`
- `combobox.use-case.ts`

### Step 5: Create Commands

**File**: `application/commands/<model>/create-<model>.command.ts`

```typescript
export interface CreateModelCommand {
  name: string;
  description?: string | null;
}
```

### Step 6: Create DTOs

**File**: `presentation/dto/<model>/create-<model>.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequiredStringValidation, OptionalStringValidation } from '@/core/infrastructure/decorators';

export class CreateModelDto {
  @ApiProperty({
    description: 'Model name',
    example: 'Example',
    minLength: 1,
    maxLength: 100,
  })
  @RequiredStringValidation({
    field_name: 'Model name',
    min_length: 2,
    max_length: 255,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Example description',
    maxLength: 1000,
  })
  @OptionalStringValidation({ ... })
  description?: string | null;
}
```

### Step 7: Create Controller

**File**: `presentation/controllers/<model>/<model>.controller.ts`

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
    const command: CreateModelCommand = { ... };
    return this.createModelUseCase.execute(command, requestInfo);
  }
}
```

### Step 8: Create Infrastructure

- **Entity**: `infrastructure/database/entities/<model>.entity.ts`
- **Repository Implementation**: `infrastructure/database/repositories/<model>.repository.impl.ts`
- **Mapper**: `infrastructure/mappers/<model>.mapper.ts` (if needed)

### Step 9: Register Module

Add feature module to `app.module.ts`:

```typescript
imports: [
  // ...
  ModelManagementModule,
];
```

### Step 10: Add Swagger Tags

Add tags in `main.ts`:

```typescript
.addTag('Model', 'Model management endpoints')
```

## Adding a New Endpoint

### 1. Add Use Case

Create or update use case in `application/use-cases/<model>/`:

```typescript
@Injectable()
export class NewOperationUseCase {
  // ...
}
```

### 2. Add Command (if needed)

Create command interface in `application/commands/<model>/`:

```typescript
export interface NewOperationCommand {
  // ...
}
```

### 3. Add DTO

Create DTO in `presentation/dto/<model>/`:

```typescript
export class NewOperationDto {
  // ...
}
```

### 4. Add Controller Method

Add method to controller:

```typescript
@Version('1')
@Post('new-operation')
@ApiOperation({ summary: 'Description' })
@ApiBody({ type: NewOperationDto })
@ApiResponse({ status: 200, description: 'Success' })
@ApiBearerAuth('JWT-auth')
async newOperation(
  @Body() dto: NewOperationDto,
  @Req() request: Request,
): Promise<ResponseType> {
  // ...
}
```

## Database Changes

### Creating Migrations

```bash
# Create empty migration
yarn migration:create src/core/infrastructure/database/migrations/MigrationName

# Generate migration from entity changes
yarn migration:generate src/core/infrastructure/database/migrations/MigrationName
```

### Migration Best Practices

1. **Always test migrations**: Test on development database first
2. **Backward compatible**: Make migrations reversible when possible
3. **Data migrations**: Handle data transformations carefully
4. **Indexes**: Add indexes for frequently queried columns
5. **Foreign keys**: Add foreign key constraints

### Adding Audit Fields

All entities must include these audit fields in order:

```typescript
@Column({ type: 'varchar', length: 255, nullable: true })
deleted_by: string | null;

@DeleteDateColumn({ nullable: true })
@Index()
deleted_at: Date | null;

@Column({ type: 'varchar', length: 255, nullable: true })
created_by: string | null;

@CreateDateColumn()
created_at: Date;

@Column({ type: 'varchar', length: 255, nullable: true })
updated_by: string | null;

@UpdateDateColumn()
updated_at: Date;
```

## Testing

### Unit Tests

Create test files: `*.spec.ts`

```typescript
describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  // ...

  beforeEach(async () => {
    // Setup
  });

  it('should create a role', async () => {
    // Test
  });
});
```

### Running Tests

```bash
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test:cov          # With coverage
```

### E2E Tests

Create E2E test files in `test/`:

```typescript
describe('Roles (e2e)', () => {
  it('/api/v1/roles (POST)', () => {
    // Test
  });
});
```

Run E2E tests:

```bash
yarn test:e2e
```

## Code Review Checklist

### Domain Layer

- [ ] Domain model has no framework imports
- [ ] Business logic in domain model methods
- [ ] Validation in `validate()` method
- [ ] Domain exceptions for business rule violations
- [ ] Repository interface in domain

### Application Layer

- [ ] Use case follows standard pattern
- [ ] Transaction wrapper used
- [ ] Activity logging included
- [ ] RequestInfo passed for audit trail
- [ ] No business logic in use case

### Infrastructure Layer

- [ ] Repository implements domain interface
- [ ] Mapper converts between entity and domain
- [ ] Entity includes all audit fields
- [ ] Database-specific code isolated

### Presentation Layer

- [ ] Controller has Swagger decorators
- [ ] DTO has validation decorators
- [ ] DTO mapped to command correctly
- [ ] RequestInfo extracted
- [ ] Proper HTTP status codes

### General

- [ ] Code follows naming conventions
- [ ] Imports organized correctly
- [ ] No unused imports
- [ ] Error handling implemented
- [ ] Code formatted and linted

## Git Workflow

### Branch Naming

- `feature/<feature-name>` - New features
- `fix/<bug-description>` - Bug fixes
- `refactor/<description>` - Refactoring
- `docs/<description>` - Documentation

### Commit Messages

Follow conventional commits:

```
feat: add user management feature
fix: resolve pagination issue
refactor: improve transaction handling
docs: update API documentation
```

### Pull Request Process

1. Create feature branch
2. Make changes
3. Run tests and linting
4. Create pull request
5. Address review comments
6. Merge after approval

## Common Tasks

### Adding a New Permission

1. Add to seeders (`create-default-permissions.seed.ts`)
2. Add to role mappings (`create-default-role-permissions.seed.ts`)
3. Run seeders
4. Or create via API if custom permission

### Updating Swagger Documentation

1. Add `@ApiOperation` with summary
2. Add `@ApiResponse` for status codes
3. Add `@ApiParam` for path parameters
4. Add `@ApiBody` for request body
5. Ensure DTOs have `@ApiProperty` decorators

### Debugging

1. **Check logs**: Application logs show detailed errors
2. **Use debugger**: `yarn start:debug` and attach debugger
3. **Database queries**: Check database directly
4. **Swagger UI**: Test endpoints via Swagger

## Related Documentation

- **Setup Guide**: `docs/setup-guide.md`
- **Architecture Guide**: `docs/architecture-guide.md`
- **API Usage Guide**: `docs/api-usage-guide.md`
- **RBAC Guide**: `docs/rbac.md`
