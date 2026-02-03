# Deployment Guide

Guide for deploying the HRIS API to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Build Process](#build-process)
- [Database Setup](#database-setup)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass (`yarn test`)
- [ ] Code is linted (`yarn lint`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Database backups created
- [ ] SSL certificates configured (for HTTPS)
- [ ] CORS origins configured correctly
- [ ] JWT secret is secure and random
- [ ] Admin account credentials changed from default

## Environment Configuration

### Production Environment Variables

Create `.env.prod` or set environment variables:

```env
# Application Environment
NODE_ENV=production
PORT=3000
SERVER=api.yourdomain.com
CORS_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com

# Database Configuration
DB_URL=postgresql://user:password@host:5432/rbac_prod

# JWT Configuration
JWT_SECRET=<generate-secure-random-32-plus-characters>
JWT_EXPIRATION=8H

# Admin Account (for initial seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-secure-password>
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator
```

### Security Considerations

1. **JWT Secret**: Generate a strong, random secret:

   ```bash
   openssl rand -hex 32
   ```

2. **Database Password**: Use strong, unique password

3. **CORS Origins**: Only allow trusted domains

4. **Environment Variables**: Never commit `.env` files

5. **HTTPS**: Always use HTTPS in production

## Build Process

### 1. Install Dependencies

```bash
yarn install --frozen-lockfile
```

### 2. Build Application

```bash
yarn build
```

This creates the `dist/` folder with compiled JavaScript.

### 3. Verify Build

```bash
# Check dist folder exists
ls -la dist/

# Verify main.js exists
ls dist/main.js
```

## Database Setup

### 1. Create Production Database

```sql
CREATE DATABASE rbac_prod;
```

### 2. Run Migrations

```bash
# Set production environment
export NODE_ENV=production

# Run migrations
yarn migration:run
```

### 3. Verify Migrations

```bash
yarn migration:show
```

All migrations should show as executed.

### 4. Seed Initial Data

```bash
yarn seed:run
```

This creates:

- Default roles (Admin, Editor, Viewer)
- Default permissions
- Role-permission mappings
- Admin user account

**Important**: Change admin password immediately after first login.

## Deployment Options

### Option 1: PM2 (Recommended)

#### Install PM2

```bash
npm install -g pm2
```

#### Create PM2 Ecosystem File

**File**: `ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'hris-api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

#### Start Application

```bash
pm2 start ecosystem.config.js
```

#### PM2 Commands

```bash
pm2 list              # List processes
pm2 logs              # View logs
pm2 restart hris-api  # Restart
pm2 stop hris-api     # Stop
pm2 delete hris-api   # Delete
pm2 save              # Save process list
pm2 startup           # Setup startup script
```

### Option 2: Docker

#### Create Dockerfile

**File**: `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY . .

# Build application
RUN yarn build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
```

#### Create Docker Compose

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_URL=postgresql://user:password@db:5432/rbac
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=rbac
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Build and Run

```bash
docker-compose build
docker-compose up -d
```

### Option 3: Systemd Service

#### Create Service File

**File**: `/etc/systemd/system/hris-api.service`

```ini
[Unit]
Description=HRIS API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/hris-api
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/hris-api/.env

[Install]
WantedBy=multi-user.target
```

#### Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable hris-api
sudo systemctl start hris-api
sudo systemctl status hris-api
```

## Post-Deployment

### 1. Verify Server Status

```bash
# Check if server is running
curl http://localhost:3000/api/v1/health

# Or check process
pm2 list  # If using PM2
systemctl status hris-api  # If using systemd
```

### 2. Test Authentication

```bash
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin",
    "password": "<admin-password>"
  }'
```

### 3. Test Protected Endpoint

```bash
TOKEN="<jwt-token-from-login>"

curl https://api.yourdomain.com/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Verify Swagger Documentation

Access: `https://api.yourdomain.com/api/docs`

### 5. Change Default Admin Password

**Important**: Change the default admin password immediately:

```bash
# Login as admin
# Use change password endpoint
POST /api/v1/users/1/change-password
{
  "new_password": "<strong-new-password>"
}
```

## Monitoring

### Application Logs

#### Winston Logs

Application logs are written via Winston. Check log files or console output.

#### PM2 Logs

```bash
pm2 logs hris-api
pm2 logs hris-api --lines 100  # Last 100 lines
```

#### Systemd Logs

```bash
sudo journalctl -u hris-api -f
sudo journalctl -u hris-api --since "1 hour ago"
```

### Health Checks

Implement health check endpoint:

```typescript
@Get('health')
@Public()
health() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
}
```

### Database Monitoring

Monitor database:

- Connection pool usage
- Query performance
- Table sizes
- Index usage

### Performance Monitoring

Consider implementing:

- APM tools (e.g., New Relic, Datadog)
- Error tracking (e.g., Sentry)
- Log aggregation (e.g., ELK stack)

## Troubleshooting

### Issue: Application Won't Start

**Check**:

1. Environment variables set correctly
2. Database connection working
3. Port not already in use
4. Dependencies installed
5. Build completed successfully

**Debug**:

```bash
# Check logs
pm2 logs hris-api

# Check environment
env | grep NODE_ENV
env | grep DB_URL
env | grep JWT_SECRET

# Test database connection
psql $DB_URL -c "SELECT 1"
```

### Issue: Database Connection Errors

**Check**:

1. Database server running
2. Connection string correct
3. Database exists
4. User has permissions
5. Network/firewall allows connection

**Test**:

```bash
psql $DB_URL -c "SELECT version()"
```

### Issue: Migration Errors

**Check**:

1. Database schema matches migrations
2. No conflicting migrations
3. Database user has CREATE/ALTER permissions

**Solution**:

```bash
# Check migration status
yarn migration:show

# If needed, revert and re-run
yarn migration:revert
yarn migration:run
```

### Issue: High Memory Usage

**Solutions**:

1. Use PM2 cluster mode (already configured)
2. Increase server memory
3. Optimize queries
4. Add caching layer

### Issue: Slow Response Times

**Check**:

1. Database query performance
2. Network latency
3. Server resources (CPU, memory)
4. N+1 query problems

**Solutions**:

1. Add database indexes
2. Optimize queries
3. Add caching (Redis)
4. Scale horizontally

## Backup and Recovery

### Database Backups

#### Automated Backup Script

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="rbac_prod"

pg_dump $DB_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

#### Restore Backup

```bash
psql $DB_URL < backup_20260203_120000.sql
```

### Application Backups

Backup:

- Environment files (`.env.prod`)
- Configuration files
- SSL certificates
- Migration files

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use nginx or cloud load balancer
2. **Multiple Instances**: Run multiple API instances
3. **Session Storage**: Use Redis for shared session storage (if needed)
4. **Database**: Use read replicas for read-heavy workloads

### Vertical Scaling

1. **Increase Server Resources**: More CPU, RAM
2. **Database Optimization**: Tune PostgreSQL
3. **Connection Pooling**: Configure connection pool size

## Security Hardening

### 1. HTTPS Only

Configure reverse proxy (nginx) to:

- Redirect HTTP to HTTPS
- Use strong SSL/TLS configuration
- Enable HSTS headers

### 2. Rate Limiting

Implement rate limiting:

- Per IP address
- Per user/endpoint
- Use nginx or application-level rate limiting

### 3. Input Validation

- All inputs validated via DTOs
- SQL injection prevented (TypeORM parameterized queries)
- XSS prevention (input sanitization)

### 4. Security Headers

Add security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### 5. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Apply security patches promptly

## Related Documentation

- **Setup Guide**: `docs/setup-guide.md`
- **API Usage Guide**: `docs/api-usage-guide.md`
- **Architecture Guide**: `docs/architecture-guide.md`
