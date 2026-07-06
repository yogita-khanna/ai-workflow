# Repository Context Index

This is a living context document for agents and developers working in this repository. It provides a continuously-updated index of active features, architecture, and known constraints.

## Current Architecture Overview
- **Structure:** Monorepo using `pnpm workspaces` + `Turborepo`.
- **Frontend:** Next.js (App Router) in `apps/web/`.
- **Backend:** NestJS (TypeScript) in `apps/api/`.
- **Database:** PostgreSQL (No ORM, raw SQL using `pg` Pool).
- **Core Guardrails:** Strict 3-tier Dependency Injection (Controllers -> Services -> Repositories). Auth cookies are HttpOnly/Secure. Argon2 password hashing.

## Active Initiatives & Specs
- **Active Initiatives:**
  - [Init-1]: [Feature Description] — Spec: [/docs/context/specs/Init-1.md] — Status: [In Review / Implementing]

## Known Constraints & Gotchas
- **No ORMs:** DO NOT install or use Prisma, TypeORM, or Sequelize.
- **SQL Parameterization:** All SQL queries MUST use parameterized variables (`$1, $2`). Template literals (`${}`) or string concatenations inside queries will result in PR rejection.
- **Testing Constraints:** Integration tests must run against a live PostgreSQL container (no mocking the DB). Unit tests mock the repository pool.
- **SSR Safety:** Never pass database credentials, password hashes, or sensitive configuration props from server components to client components.

## Index of Context Records
- **Specs Directory:** [/docs/context/specs/](file:///docs/context/specs/)
- **ADRs Directory:** [/docs/context/adrs/](file:///docs/context/adrs/)
- **Agent Session Logs:** [/docs/context/sessions/](file:///docs/context/sessions/)
