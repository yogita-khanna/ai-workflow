# Technical Design Specification (DEV-001)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `AuthController` (`/auth/login`, `/auth/refresh`, `/auth/logout`)
- **Services:** `AuthService`, `UsersService`, `TokenService`
- **Repositories:** `UsersRepository`, `TokensRepository` (injecting `pg.Pool`).

## 2. Data Layer (PostgreSQL Raw SQL)
### UP Migration
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Must be Argon2
  role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

CREATE TABLE refresh_tokens (
  token_hash VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### DOWN Migration
```sql
DROP TABLE refresh_tokens;
DROP TABLE users;
```

## 3. Security & Validation (Zero-Trust)
### DTOs
`LoginDto` uses `@IsEmail()`, `@IsString()`, `@MaxLength(255)`.
### Authentication
`@UseGuards(JwtAuthGuard, RolesGuard)`, `@RequirePermission('admin')` for protected routes.
### Rate Limiting
5 req/min on `/auth/login` using `@Throttle()`.

## 4. Frontend Layer (Next.js App Router)
### Component Boundaries
- **Server Components:** `app/(auth)/login/page.tsx`
- **Client Components:** `components/LoginForm.tsx` (using `"use client"`. No sensitive props passed).

## 5. Observability
- **Error Handling:** Throw `UnauthorizedException` on invalid credentials. Log repeated failures to monitor brute force attempts.
