# Technical Design Specification (DEV-004)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `PasswordResetController` (`POST /auth/forgot-password`, `POST /auth/reset-password`)
- **Services:** `PasswordResetService`, `EmailService` (mocked)
- **Repositories:** `PasswordResetTokensRepository` (injects `pg.Pool`)

## 2. Data Layer (PostgreSQL Raw SQL)
### UP Migration
```sql
CREATE TABLE password_reset_tokens (
  token_hash VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL
);
```
### DOWN Migration
```sql
DROP TABLE password_reset_tokens;
```

## 3. Security & Validation (Zero-Trust)
### DTOs
- `ForgotPasswordDto`: `@IsEmail()`
- `ResetPasswordDto`: `@IsString()`, `@MinLength(12)`, `@IsString()` for the token.
### Authentication
Both endpoints must be public (no `@UseGuards(JwtAuthGuard)`).
### Security Rules
- The raw token sent in the email MUST NOT be stored in the database. Only an Argon2 hash of the token is stored in `password_reset_tokens`.
- Rate Limiting: 3 requests per hour on `/auth/forgot-password` to prevent email enumeration/spam.

## 4. Frontend Layer (Next.js App Router)
### Component Boundaries
- **Server Components:** `app/(auth)/forgot-password/page.tsx`
- **Client Components:** `<ForgotPasswordForm />` and `<ResetPasswordForm />` (uses `"use client"` and Next.js Server Actions for mutation).
- **State Logic:** Read the `token` from Next.js URL Search Parameters to pass to the `<ResetPasswordForm />`.
