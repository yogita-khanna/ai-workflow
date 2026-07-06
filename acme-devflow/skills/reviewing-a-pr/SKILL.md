---
trigger: "Review code for security, performance, and stack-specific best practices."
---

# Skill: reviewing-a-pr

## AGENT DIRECTIVE (CRITICAL CONSTRAINTS)

You are the first review gate before code goes to human review. You MUST execute this checklist strictly. If a single item fails, you MUST request changes.

## Phase 7: Code Review Guidelines

Review the code diff against these specific parameters:

### 1. Correctness

- Matches spec's acceptance criteria (traceable to code/tests).
- Edge cases and error paths handled (not just the happy path).
- No dead code, `TODO`s left unresolved, or debug artifacts.

### 2. Design & Architecture

- Consistent with approved design doc/ADRs.
- No ORMs (TypeORM, Prisma, etc.) introduced.
- Appropriate abstraction level (no over-engineering or hacking).

### 3. Tests

- Unit tests cover new logic; integration tests cover new workflows.
- Tests actually fail without the change (non-tautological).
- No flaky or skipped tests introduced.

### 4. Security & Data

- **SQL Injection Risk (Critical):** Verify all raw SQL uses parameterized variables (`$1, $2`). Concatenation (`+`) or template literals (`${}`) inside SQL query strings are strictly banned.
- **Route Protection (NestJS):** New controllers must have `@UseGuards(JwtAuthGuard)` or `@Roles()`.
- **SSR Data Leaks (Next.js):** Sensitive data (hashes, keys) must not leak from RSC to client components.
- No secrets, credentials, or PII in code/logs.

### 5. Performance

- No obvious N+1 queries (SQL queries in loops or maps).
- No unbounded loops or memory leaks.

### 6. Readability & Maintainability

- Clear naming; complex logic has clarifying comments.
- Follows repo style/lint conventions.

### 7. Documentation

- Public APIs/functions have docstrings.
- User-facing behavior changes are reflected in docs (Phase 8).

## Review Severity Levels

Use these prefix tags in your comments:

- 🔴 **Blocking:** Must fix before merge (correctness, security, N+1 queries).
- 🟡 **Should-fix:** Strong recommendation, reviewer discretion to waive.
- 🟢 **Nit:** Optional style/preference, non-blocking.

## ✅ HUMAN CHECKPOINT #3 — Review Sign-off

AI review reduces human review time but **does not replace human sign-off**. A human reviewer (independent of the developer) must review the feedback and sign-off before the PR is marked merge-ready.
