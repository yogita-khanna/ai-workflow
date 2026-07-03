# Implementation Checklist (Strict DAG)

*INSTRUCTION TO AGENT: This checklist enforces a Directed Acyclic Graph (DAG) for implementation. You MUST complete Phase 1 before Phase 2. For every code task, you MUST write the test (RED) before the implementation (GREEN).*

## Phase 1: Database Infrastructure (Foundation)
- [ ] 1.1 Generate raw `.sql` up/down migrations using `node-pg-migrate`.
- [ ] 1.2 Write seed data migration (if baseline data is required).
- [ ] 1.3 Execute UP migration against local Postgres container.
- [ ] 1.4 Execute DOWN migration to verify rollback safety.
- [ ] 1.5 Re-execute UP migration.

## Phase 2: Data Access Layer (NestJS Repositories)
- [ ] 2.1 Write Jest Unit Test for Repository (Mock `pg.Pool` with expected parameterized `$1` queries). **[RED]**
- [ ] 2.2 Implement Repository methods using raw SQL (Absolutely no string concatenation). **[GREEN]**
- [ ] 2.3 Refactor and ensure 100% repository test coverage.

## Phase 3: Business Logic & API (NestJS Services & Controllers)
- [ ] 3.1 Write Jest Unit Test for Service logic. **[RED]**
- [ ] 3.2 Implement Service logic. **[GREEN]**
- [ ] 3.3 Define `class-validator` DTOs.
- [ ] 3.4 Write Jest Unit Test for Controller (Verify Guards and DTO validation). **[RED]**
- [ ] 3.5 Implement Controller (Apply `@Roles()`, `@UseGuards()`). **[GREEN]**
- [ ] 3.6 Write and run Integration Test against real Postgres container. **[RED -> GREEN]**

## Phase 4: Presentation Layer (Next.js App Router)
- [ ] 4.1 Write RTL (React Testing Library) test for new components. **[RED]**
- [ ] 4.2 Implement UI Components (Strict RSC vs Client separation). **[GREEN]**
- [ ] 4.3 Implement Page routing and `middleware.ts` updates.
- [ ] 4.4 Run Playwright E2E test verifying end-to-end flow. **[RED -> GREEN]**

## Phase 5: CI & PR Validation
- [ ] 5.1 Run `pnpm turbo run lint test build` (Must be 0 errors).
- [ ] 5.2 Self-Review against `reviewing-a-pr` security checklist.
- [ ] 5.3 Open PR.
