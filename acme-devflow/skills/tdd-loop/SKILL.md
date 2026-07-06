---
trigger: "Run the Red-Green-Refactor loop using Jest for backend and RTL/Playwright for frontend."
---

# Skill: tdd-loop

## AGENT DIRECTIVE (CRITICAL CONSTRAINTS)
You must execute the implementation exactly as dictated by `tasks.md` in a strict RED -> GREEN loop.
1. **Never write implementation code before writing a failing test.**
2. **Never mock the database in Integration Tests.** You must use a live Postgres container for all e2e/integration tests.
3. **Never bypass Turborepo.** You must run tests via `npx turbo run test`.

## TOKEN & CONTEXT OPTIMIZATION (CRITICAL)
- **Mandatory First Step**: You MUST read the `CONTEXT.md` file in the root of the repository before doing any work. This file holds the entire architecture context and active initiatives.
- **Strict Bounds**: Rely entirely on the architecture defined in `CONTEXT.md` and the `design.md` for this ticket. Do not explore directories outside of the modules you are assigned to implement.

## Step-by-Step Guidance

### Phase 5: Implementation
1. **Check `tasks.md`**: Identify the next incomplete task in the DAG.
2. **Write the Failing Test (Red)**:
   - Backend Unit: `*.spec.ts`. Mock the raw `pg.Pool` repository layer.
   - Frontend Unit: `*.test.tsx` using React Testing Library.
   - Satisfy specific Spec Acceptance Criteria.
3. **Execute Test**: Run `npx turbo run test --filter=<workspace>` and verify it FAILS.
4. **Write the Implementation (Green)**:
   - Implement the raw SQL, NestJS service, or Next.js component.
5. **Execute Test**: Run tests and verify they PASS.
6. **Refactor**: Clean up code and check styling constraints.
7. **Mark Task Complete**: Update `[x]` in `tasks.md`.

### Phase 6: Self-Review & Tests
Once all tasks in `tasks.md` are marked complete, perform self-review:
1. **Run Full Verification**: Run linting, type checks, and all tests via `npx turbo run lint test build` from root. Ensure 0 errors.
2. **Perform Self-Diff Review**:
   - Compare your git diff against the approved Spec Acceptance Criteria.
   - Verify every acceptance criterion has a matching, passing test.
   - Check for dead code, left-over `TODO`s, or debug logs.
3. **Generate Session Summary**: Update or write the agent session summary (`docs/context/sessions/<date>-<feature>.md`).
