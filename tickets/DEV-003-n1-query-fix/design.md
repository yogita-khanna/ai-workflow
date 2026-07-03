# Technical Design Specification (DEV-003)

## 1. Architecture & DI Boundaries (NestJS)
- **Repositories:** `UsersRepository` (`findAllWithRoles` method).

## 2. Data Layer (PostgreSQL Raw SQL)
### UP/DOWN Migrations
*N/A - No schema changes required.*

### The Refactored Query
Instead of looping in the `UsersService`, the `UsersRepository` will execute:
```sql
SELECT 
    u.id, 
    u.email, 
    r.role_name 
FROM users u
LEFT JOIN user_roles r ON u.id = r.user_id
ORDER BY u.created_at DESC
LIMIT $1 OFFSET $2;
```

## 3. Security & Validation (Zero-Trust)
*No changes to Auth/DTOs required. Existing `@RequirePermission('admin')` applies.*

## 4. Frontend Layer (Next.js App Router)
*No frontend changes. API contract remains identical.*
