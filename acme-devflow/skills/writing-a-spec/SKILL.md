---
trigger: "Write a technical specification (spec, design, tasks) for a ticket."
---

# Skill: writing-a-spec

## AGENT DIRECTIVE (CRITICAL CONSTRAINTS)

You are generating the technical blueprint for the system. If your blueprint is flawed, the implementation will fail. You MUST adhere to the following rigid constraints:

1. **NO ORMS**: You are strictly forbidden from proposing TypeORM, Prisma, Sequelize, Kysely, or any other query builder/ORM. You MUST design raw SQL queries to be executed via `pg.Pool`.
2. **SECURITY FIRST**: You MUST explicitly map every new API endpoint to a Guard (`JwtAuthGuard`, `RolesGuard`) and state the exact permission/role required.
3. **MIGRATION SAFETY**: Every `UP` schema change MUST have a safe `DOWN` schema change. If you propose `DROP COLUMN` in a down migration, you must explicitly document the data loss risk in the rollback strategy.

## Phase 1 to 4 Execution Flow

### Step 1: Discovery & Framing (Phase 1)

- Turn the raw ticket/idea into a clear problem statement.
- Identify the core goals and non-goals.
- Run `/devflow:propose <ticket-id>` to scaffold the ticket spec directory.

### Step 2: Spec Writing (Phase 2)

- Populate `tickets/<ticket-id>/spec.md` based on the new Spec template.
- Perform the risk classification using the `classify-ticket` skill guidelines.
- **✅ HUMAN CHECKPOINT #1 (Spec Approval):** Stop and ask the human (PM/Tech Lead) to review and approve scope, goals, and non-goals in `spec.md` (Status -> `Approved`).

### Step 3: Technical Design / Architecture (Phase 3)

- Once the spec is approved, draft `tickets/<ticket-id>/design.md`.
- **UUID Routing & Security:** Auto-incrementing integer IDs (e.g. `id = 1`) MUST NOT be exposed in API routes, query parameters, or payloads. Use secure UUIDs (v4) or public UIDs for route resource lookups to prevent IDOR vulnerabilities.
- **Database Indexing:** Ensure every foreign key, lookup UUID, and filter criteria field is indexed in the schema migrations to maintain query performance at production scale.
- Explicitly detail DTO classes with validation, raw SQL migration queries (UP/DOWN), indexing, Next.js server/client component boundaries, and middleware changes.
- Propose Architecture Decision Records (ADRs) for non-trivial decisions using the `adr.md` template. Save them in the ticket folder.
- **✅ HUMAN CHECKPOINT #2 (Design Approval):** Stop and ask a senior engineer/architect to review and approve the design and any ADRs (Status -> `Approved`).

### Step 4: Swagger API Specification (Phase 4)

- Once the technical design is approved, draft precise OpenAPI/Swagger schemas.
- Ensure that exposed resource endpoints utilize UUIDs or public secure tokens. Auto-incrementing IDs (`id=1`) are strictly forbidden in public parameters/paths.
- **✅ HUMAN CHECKPOINT (Swagger Approval):** Stop and ask the architect to sign off on the Swagger API contracts. Do not generate code stubs or proceed to task planning until this is approved.

### Step 5: Task Breakdown (Phase 5)

- Break down the approved design into a Directed Acyclic Graph (DAG) task checklist in `tickets/<ticket-id>/tasks.md` based on the template.
- Ensure each task is atomic and maps back to specific Spec Acceptance Criteria.

## Quality Assurance Check

Before presenting the spec/design to the user, verify:

- [ ] Did I accidentally use an ORM? (If yes, rewrite).
- [ ] Are all SQL variables parameterized (e.g., `$1, $2`)?
- [ ] Are all new endpoints protected by JwtAuthGuard or RolesGuard?
- [ ] Do all UP migrations have a valid, tested DOWN migration?
