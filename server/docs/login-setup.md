# Login Setup Guide

This guide explains how to set up and use the login functionality.

---

## Prerequisites

### Install bcrypt

The login functionality requires `bcrypt` for password hashing. Install it:

```bash
yarn add bcrypt
yarn add -D @types/bcrypt
```

---

## Login Endpoint

### Endpoint

```
POST /api/v1/auth/login
```

### Request Body

```json
{
  "username_or_email": "admin",
  "password": "password123"
}
```

### Response

**Success (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "middle_name": null,
    "last_name": "User"
  }
}
```

**Error (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## How It Works

### Login Flow

1. **User submits credentials** - Username/email and password
2. **Find user** - Search by username or email (case-insensitive)
3. **Validate user** - Check if user exists, is active, and not archived
4. **Verify password** - Compare provided password with hashed password
5. **Generate JWT** - Create JWT token with user information
6. **Return token** - Send access token and user info

### Password Verification

- Passwords are hashed using bcrypt (10 salt rounds)
- Stored passwords are compared using `bcrypt.compare()`
- Plain text passwords are never stored

---

## Usage Examples

### Login with Username

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username_or_email": "admin",
  "password": "password123"
}
```

### Login with Email

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username_or_email": "admin@example.com",
  "password": "password123"
}
```

### Using the Token

After login, include the token in subsequent requests:

```http
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Scenarios

### Invalid Credentials

**Request:**

```json
{
  "username_or_email": "admin",
  "password": "wrongpassword"
}
```

**Response (401):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### User Not Found

**Request:**

```json
{
  "username_or_email": "nonexistent",
  "password": "password123"
}
```

**Response (401):**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### User Archived

**Response (401):**

```json
{
  "statusCode": 401,
  "message": "User account is archived",
  "error": "Unauthorized"
}
```

### User Inactive

**Response (401):**

```json
{
  "statusCode": 401,
  "message": "User account is inactive",
  "error": "Unauthorized"
}
```

### Password Not Set

**Response (401):**

```json
{
  "statusCode": 401,
  "message": "Password not set for this account",
  "error": "Unauthorized"
}
```

---

## Security Features

1. **Password Hashing** - Passwords are hashed using bcrypt before storage
2. **Case-Insensitive Lookup** - Username/email lookup is case-insensitive
3. **Account Validation** - Checks for archived/inactive accounts
4. **JWT Tokens** - Secure token-based authentication
5. **No Password Exposure** - Passwords are never returned in responses

---

## Testing

### Test Login

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin",
    "password": "password123"
  }'

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer <token_from_login>"
```

### Using HTTP Files

See `server/api/auth-api.http` for ready-to-use examples.

---

## Integration with Authorization

After login, use the token with authorization guards:

```typescript
// Login first to get token
POST / api / v1 / auth / login;

// Use token for protected routes
GET / api / v1 / users;
Authorization: Bearer<token>;

// Use token with role/permission guards
GET / api / v1 / admin / dashboard;
Authorization: Bearer<token>;
// Requires Admin role
```

---

## Related Documentation

- **Authentication Guide:** `server/src/features/auth/README.md`
- **Authorization Examples:** `server/docs/authorization-examples.md`
- **API Examples:** `server/api/auth-api.http`
