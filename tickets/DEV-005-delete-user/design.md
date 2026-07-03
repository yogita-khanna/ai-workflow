# Technical Design Specification (DEV-005)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `UsersController` (`DELETE /users/me`)
- **Services:** `UsersService`
- **Repositories:** `UsersRepository`

## 2. Data Layer (PostgreSQL Raw SQL)
### The Query (No Prisma!)
We will use the following raw SQL query with the `pg` driver:
```sql
DELETE FROM users WHERE id = $1;
```
*Note: Because our `refresh_tokens` and `password_reset_tokens` tables were created with `ON DELETE CASCADE` in previous migrations, this single query safely cleans up all associated records.*

## 3. Security & Validation (Zero-Trust)
### Authentication
- `@UseGuards(JwtAuthGuard)` - The user can only delete their own ID extracted from the JWT payload. They cannot pass an ID in the URL.

## 4. Frontend Layer (Next.js App Router)
- **Client Components:** `<DeleteAccountButton />` (Triggers a warning modal).
- **Server Actions:** `deleteAccountAction()` clears the HttpOnly auth cookie and redirects to `/`.
