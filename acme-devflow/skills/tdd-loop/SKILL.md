---
trigger: "Run the Red-Green-Refactor loop using Jest for backend and RTL/Playwright for frontend."
---

# Skill: tdd-loop

## AGENT DIRECTIVE (CRITICAL CONSTRAINTS)
You must execute the implementation exactly as dictated by `tasks.md` in a strict RED -> GREEN loop.
1. **Never write implementation code before writing a failing test.**
2. **Never mock the database in Integration Tests.** You must use a live Postgres container for all e2e/integration tests.
3. **Never bypass Turborepo.** You must run tests via `pnpm turbo run test`.

## TOKEN & CONTEXT OPTIMIZATION (CRITICAL)
- **Mandatory First Step**: You MUST read the `CLAUDE.md` file in the root of the repository before doing any work. This file holds the entire architecture context and strict coding standards. By reading it, you avoid having to scan the entire project to understand the stack.
- **Strict Bounds**: Rely entirely on the architecture defined in `CLAUDE.md` and the `design.md` for this ticket. Do not explore directories outside of the modules you are assigned to implement.
- **When tests fail, only read the specific error output.** Do not re-read the entire test file or run full-repo type checks if not necessary.

## Step-by-Step Guidance
1. **Check `tasks.md`**: Identify the next incomplete task.
2. **Write the Failing Test (Red)**:
   - Backend Unit: `*.spec.ts`. Mock the raw `pg.Pool` repository layer.
   - Frontend Unit: `*.test.tsx` using React Testing Library.
3. **Execute Test**: Run `pnpm turbo run test --filter=<workspace>` and verify it FAILS. (Using filters saves tokens by minimizing log output).
4. **Write the Implementation (Green)**:
   - Implement the raw SQL, NestJS service, or Next.js component.
5. **Execute Test**: Run tests and verify they PASS.
6. **Refactor**: Clean up code.
7. **Mark Task Complete**: Update `[x]` in `tasks.md`.
