# Implementation Checklist (Strict DAG)

## Phase 1: Database Infrastructure
- [ ] 1.1 Generate raw `.sql` up/down migrations using `node-pg-migrate`.
- [ ] 1.2 Write seed data migration (Admin user).
- [ ] 1.3 Execute UP migration against local Postgres container.
- [ ] 1.4 Execute DOWN migration to verify rollback safety.

## Phase 2: Data Access Layer (NestJS Repositories)
- [ ] 2.1 Write Jest Unit Test for `UsersRepository` (Mock `pg.Pool` parameterized `$1` queries). **[RED]**
- [ ] 2.2 Implement `UsersRepository` using raw SQL. **[GREEN]**

## Phase 3: Business Logic (NestJS Services)
- [ ] 3.1 Write Jest Unit Test for `AuthService`. **[RED]**
- [ ] 3.2 Implement `AuthService` (Argon2 hash, JWT gen, Postgres Transaction). **[GREEN]**
- [ ] 3.3 Write integration test with Testcontainers. **[RED -> GREEN]**

## Phase 4: Presentation Layer (Next.js)
- [ ] 4.1 Write RTL test for `LoginForm.tsx`. **[RED]**
- [ ] 4.2 Implement UI Components. **[GREEN]**
- [ ] 4.3 Run Playwright E2E test verifying end-to-end flow. **[RED -> GREEN]**
