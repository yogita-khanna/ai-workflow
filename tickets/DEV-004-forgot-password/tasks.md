# Implementation Checklist (Strict DAG)

## Phase 1: Database Infrastructure
- [ ] 1.1 Generate raw `.sql` up/down migrations for `password_reset_tokens`.
- [ ] 1.2 Execute UP migration against local Postgres container.

## Phase 2: Data Access Layer (NestJS)
- [ ] 2.1 Write Jest Unit Test for `PasswordResetTokensRepository` (Mock `pg.Pool` parameterized `$1` queries). **[RED]**
- [ ] 2.2 Implement `PasswordResetTokensRepository` using raw SQL. **[GREEN]**

## Phase 3: Business Logic (NestJS)
- [ ] 3.1 Write Jest Unit Test for `PasswordResetService` token generation and hashing. **[RED]**
- [ ] 3.2 Implement `PasswordResetService`. **[GREEN]**
- [ ] 3.3 Write Controller logic with `class-validator` DTOs and Throttler.
- [ ] 3.4 Write integration test against Testcontainers Postgres to verify full token lifecycle. **[RED -> GREEN]**

## Phase 4: Presentation Layer (Next.js)
- [ ] 4.1 Write RTL tests for `<ForgotPasswordForm />`. **[RED]**
- [ ] 4.2 Implement Next.js App Router UI pages and components. **[GREEN]**
- [ ] 4.3 Run Playwright E2E test verifying end-to-end flow. **[RED -> GREEN]**
