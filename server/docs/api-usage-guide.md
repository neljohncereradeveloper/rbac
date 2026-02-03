# API Usage Guide

Complete guide for using the HRIS API endpoints, including authentication, request/response formats, and common workflows.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Common Workflows](#common-workflows)
- [API Examples](#api-examples)

## Base URL

All API endpoints are prefixed with `/api/v1`:

```
Base URL: http://localhost:3220/api/v1
```

### API Versioning

The API uses URI versioning:

- Current version: `v1`
- All endpoints: `/api/v1/{resource}`

Future versions will be: `/api/v2/{resource}`, etc.

## Authentication

### Overview

Most endpoints require JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Public Endpoints

These endpoints do not require authentication:

- `POST /api/v1/auth/login`

### Getting a JWT Token

**Endpoint**: `POST /api/v1/auth/login`

**Request**:

```json
{
  "username_or_email": "admin",
  "password": "admin123"
}
```

**Response**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "System",
    "last_name": "Administrator",
    ...
  }
}
```

**Usage**:

```bash
# Save token to variable
TOKEN=$(curl -X POST http://localhost:3220/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"admin","password":"admin123"}' \
  | jq -r '.access_token')

# Use token in subsequent requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3220/api/v1/users
```

### Token Expiration

- Default expiration: 8 hours (configurable via `JWT_EXPIRATION`)
- Expired tokens return `401 Unauthorized`
- Re-authenticate to get a new token

## Request Format

### Content-Type

All POST/PUT/PATCH requests must include:

```
Content-Type: application/json
```

### Request Body

Request bodies should be valid JSON:

```json
{
  "name": "New Role",
  "description": "Role description",
  "permission_ids": [1, 2, 3]
}
```

### Path Parameters

Numeric IDs in URLs are parsed as integers:

```
GET /api/v1/users/123
PUT /api/v1/roles/456
```

### Query Parameters

Query parameters for pagination and filtering:

```
GET /api/v1/users?page=1&limit=10&term=search&is_archived=false
```

## Response Format

### Success Responses

#### Single Resource

```json
{
  "id": 1,
  "name": "Admin",
  "description": "Administrator role",
  "created_at": "2026-02-03T10:00:00.000Z",
  "updated_at": "2026-02-03T10:00:00.000Z"
}
```

#### Paginated List

```json
{
  "data": [
    { "id": 1, "name": "Admin", ... },
    { "id": 2, "name": "Editor", ... }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_records": 25,
    "total_pages": 3,
    "next_page": 2,
    "previous_page": null
  }
}
```

#### Success Message

```json
{
  "success": true
}
```

### HTTP Status Codes

| Status Code | Meaning               | Usage                                      |
| ----------- | --------------------- | ------------------------------------------ |
| 200         | OK                    | Successful GET, PUT, DELETE, PATCH         |
| 201         | Created               | Successful POST (create)                   |
| 400         | Bad Request           | Validation error, invalid input            |
| 401         | Unauthorized          | Missing or invalid token                   |
| 403         | Forbidden             | Insufficient permissions                   |
| 404         | Not Found             | Resource doesn't exist                     |
| 409         | Conflict              | Resource conflict (e.g., already archived) |
| 500         | Internal Server Error | Server error                               |

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Errors

#### 400 Bad Request - Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 2 characters",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

**Causes**:

- Missing required fields
- Invalid field format
- Field length violations
- Pattern validation failures

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes**:

- Missing Authorization header
- Invalid or expired token
- Token format incorrect

**Solution**: Re-authenticate to get a new token.

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

**Causes**:

- User doesn't have required role
- User doesn't have required permission

**Solution**: Contact administrator to assign appropriate roles/permissions.

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Role with ID 999 not found"
}
```

**Causes**:

- Resource doesn't exist
- Resource ID is invalid
- Resource is archived (for some endpoints)

#### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Role is already archived"
}
```

**Causes**:

- Trying to archive already archived resource
- Trying to restore non-archived resource
- Duplicate resource creation

## Pagination

### Pagination Parameters

| Parameter     | Type   | Required | Default | Description                              |
| ------------- | ------ | -------- | ------- | ---------------------------------------- |
| `page`        | number | No       | 1       | Page number (1-indexed)                  |
| `limit`       | number | No       | 10      | Items per page (max: 100)                |
| `term`        | string | No       | ""      | Search term                              |
| `is_archived` | string | No       | "false" | Filter archived records ("true"/"false") |

### Example Request

```
GET /api/v1/users?page=2&limit=20&term=john&is_archived=false
```

### Pagination Response

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total_records": 45,
    "total_pages": 3,
    "next_page": 3,
    "previous_page": 1
  }
}
```

### Pagination Best Practices

1. **Start with page 1**: First page is `page=1`, not `page=0`
2. **Reasonable limits**: Use `limit=10` to `limit=50` for best performance
3. **Use search term**: Use `term` parameter for filtering
4. **Handle null pages**: `next_page` or `previous_page` can be `null`

## Common Workflows

### Workflow 1: User Management

#### 1. Create a User

```http
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true
}
```

#### 2. Get User List

```http
GET /api/v1/users?page=1&limit=10
Authorization: Bearer <token>
```

#### 3. Get User by ID

```http
GET /api/v1/users/1
Authorization: Bearer <token>
```

#### 4. Update User

```http
PUT /api/v1/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "first_name": "John",
  "last_name": "Smith"
}
```

#### 5. Archive User

```http
DELETE /api/v1/users/1/archive
Authorization: Bearer <token>
```

#### 6. Restore User

```http
PATCH /api/v1/users/1/restore
Authorization: Bearer <token>
```

### Workflow 2: RBAC Setup

#### 1. Create Permission

```http
POST /api/v1/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "reports:generate",
  "resource": "reports",
  "action": "generate",
  "description": "Generate reports"
}
```

#### 2. Create Role with Permissions

```http
POST /api/v1/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Report Manager",
  "description": "Can generate reports",
  "permission_ids": [1, 2, 3]
}
```

#### 3. Assign Role to User

```http
POST /api/v1/users/5/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "role_ids": [2],
  "replace": false
}
```

#### 4. Grant Permission Override to User

```http
POST /api/v1/users/5/permissions/grant
Authorization: Bearer <token>
Content-Type: application/json

{
  "permission_ids": [10],
  "replace": false
}
```

### Workflow 3: Holiday Management

#### 1. Create Holiday

```http
POST /api/v1/holidays
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Year's Day",
  "date": "2024-01-01",
  "type": "national",
  "description": "New Year celebration",
  "is_recurring": true
}
```

#### 2. Get Holidays List

```http
GET /api/v1/holidays?page=1&limit=10&is_archived=false
Authorization: Bearer <token>
```

#### 3. Update Holiday

```http
PUT /api/v1/holidays/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Year's Day",
  "date": "2024-01-01",
  "type": "national",
  "description": "Updated description"
}
```

## API Examples

### Using cURL

#### Login

```bash
curl -X POST http://localhost:3220/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin",
    "password": "admin123"
  }'
```

#### Get Users (with token)

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3220/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Create Role

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3220/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager",
    "description": "Manager role",
    "permission_ids": [1, 2, 3]
  }'
```

### Using HTTP Files

The project includes `.http` files in the `api/` folder for testing:

- `api/auth-api.http` - Authentication endpoints
- `api/user-management-api.http` - User management endpoints
- `api/rbac-api.http` - RBAC endpoints
- `api/holiday-api.http` - Holiday endpoints

**Example** (`api/auth-api.http`):

```http
### Login
POST http://localhost:3220/api/v1/auth/login
Content-Type: application/json

{
  "username_or_email": "admin",
  "password": "admin123"
}
```

### Using Postman/Insomnia

1. **Import Collection**: Use Swagger JSON from `/api/docs-json`
2. **Set Base URL**: `http://localhost:3220/api/v1`
3. **Authentication**:
   - Type: Bearer Token
   - Token: Get from login endpoint
4. **Environment Variables**:
   - `base_url`: `http://localhost:3220/api/v1`
   - `token`: JWT token from login

### Using JavaScript/TypeScript

```typescript
// Login
const loginResponse = await fetch('http://localhost:3220/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username_or_email: 'admin',
    password: 'admin123',
  }),
});

const { access_token } = await loginResponse.json();

// Get users
const usersResponse = await fetch('http://localhost:3220/api/v1/users', {
  headers: {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  },
});

const users = await usersResponse.json();
```

### Using Python

```python
import requests

# Login
login_response = requests.post(
    'http://localhost:3220/api/v1/auth/login',
    json={
        'username_or_email': 'admin',
        'password': 'admin123'
    }
)

token = login_response.json()['access_token']

# Get users
users_response = requests.get(
    'http://localhost:3220/api/v1/users',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
)

users = users_response.json()
```

## Best Practices

### 1. Token Management

- **Store securely**: Never commit tokens to version control
- **Handle expiration**: Implement token refresh logic
- **Reuse tokens**: Use the same token for multiple requests
- **Validate tokens**: Check token validity before making requests

### 2. Error Handling

- **Check status codes**: Always check HTTP status before processing response
- **Handle 401**: Implement automatic re-authentication
- **Handle 403**: Show user-friendly permission error messages
- **Validate input**: Validate data before sending requests

### 3. Pagination

- **Use reasonable limits**: Don't request too many items at once
- **Implement infinite scroll**: Load more data as user scrolls
- **Cache results**: Cache paginated results when appropriate
- **Handle empty results**: Show appropriate message when no data

### 4. Performance

- **Batch operations**: Use bulk endpoints when available
- **Cache responses**: Cache frequently accessed data
- **Minimize requests**: Combine related data requests when possible
- **Use filters**: Use query parameters to filter server-side

### 5. Security

- **HTTPS in production**: Always use HTTPS for production
- **Validate input**: Validate all user input
- **Sanitize output**: Sanitize data before displaying
- **Rate limiting**: Implement rate limiting for API calls

## Rate Limiting

Currently, the API does not implement rate limiting. Consider implementing:

- Per-user rate limits
- Per-endpoint rate limits
- Global rate limits

## API Versioning

- Current version: `v1`
- All endpoints: `/api/v1/{resource}`
- Future versions: `/api/v2/{resource}`

When a new version is released:

- Old version remains available for backward compatibility
- New features added to new version
- Breaking changes only in new version

## Related Documentation

- **Setup Guide**: `docs/setup-guide.md`
- **RBAC Guide**: `docs/rbac.md`
- **Permissions Guide**: `docs/permissions-management.md`
- **Swagger UI**: `http://localhost:3220/api/docs`
