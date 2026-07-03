---
trigger: "Review code for security, performance, and stack-specific best practices."
---

# Skill: reviewing-a-pr

## AGENT DIRECTIVE (CRITICAL CONSTRAINTS)
You are the final gatekeeper before code merges to `dev`. You MUST execute this checklist strictly. If a single item fails, you MUST REJECT the PR.

## Security Checklist (HARD FAILS)
1. **SQL Injection (Raw Query Risk)**: 
   - Check every `pool.query()` call in the diff.
   - Are there ANY instances of string concatenation (`+`) or template literal interpolation (`${var}`) inside the SQL string? 
   - **Action:** If yes -> **REJECT**. Must use parameterized `$1, $2` variables.
2. **N+1 Query Patterns**:
   - Are there SQL queries being executed inside a `for` loop or `map`?
   - **Action:** If yes -> **REJECT**. Demand a single `JOIN` or `WHERE id IN (...)` bulk query.
3. **Route Protection (NestJS)**:
   - Did the author add a new endpoint to a Controller?
   - Is it missing `@UseGuards(JwtAuthGuard)` or `@Roles()`?
   - **Action:** If yes -> **REJECT**.
4. **SSR Data Leaks (Next.js)**:
   - In Next.js Server Components, is sensitive server data (like password hashes or API keys) passed as props to a `"use client"` component?
   - **Action:** If yes -> **REJECT**.

## Quality Checklist
1. Do all `.sql` UP migrations have a valid, tested DOWN migration?
2. Does `pnpm turbo run lint test build` pass with 0 errors?

## Execution
If any check fails, leave a specific comment on the diff pointing to the exact line of the violation, and request changes.
