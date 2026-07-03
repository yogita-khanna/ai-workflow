---
trigger: "Write a technical specification (proposal, design, tasks) for a ticket."
---

# Skill: writing-a-spec

## AGENT DIRECTIVE (CRITICAL CONSTRAINTS)
You are generating the technical blueprint for the system. If your blueprint is flawed, the implementation will fail. You MUST adhere to the following rigid constraints:

1. **NO ORMS**: You are strictly forbidden from proposing TypeORM, Prisma, Sequelize, Kysely, or any other query builder/ORM. You MUST design raw SQL queries to be executed via `pg.Pool`.
2. **SECURITY FIRST**: You MUST explicitly map every new API endpoint to a Guard (`JwtAuthGuard`, `RolesGuard`) and state the exact permission/role required. 
3. **MIGRATION SAFETY**: Every `UP` schema change MUST have a safe `DOWN` schema change. If you propose `DROP COLUMN` in a down migration, you must explicitly document the data loss risk in the rollback strategy.

## Step-by-Step Guidance
1. **Load Templates**: Read `acme-devflow/spec-framework/templates/proposal.md` and `design.md`.
2. **Analyze Requirements**: Parse the user's PRD or Jira ticket.
3. **Generate `proposal.md`**: Fill out all sections. Force a classification score using the `classify-ticket` skill criteria. 
4. **Wait for Approval**: If the score is `ask-human`, STOP execution and ask the human to review `proposal.md`.
5. **Generate `design.md`**: Once approved, construct the strict technical architecture. Explicitly define:
   - DTO classes with `class-validator` annotations.
   - Exact SQL strings for `node-pg-migrate`.
   - Next.js component boundary boundaries.
6. **Generate `tasks.md`**: Instantiate a copy of `templates/tasks.md` specifically tailored to the endpoints/components defined in `design.md`.

## Quality Assurance Check
Before presenting the spec to the user, verify:
- [ ] Did I accidentally use an ORM? (If yes, rewrite).
- [ ] Are all SQL variables parameterized (e.g., `$1, $2`)?
- [ ] Is rate limiting specified for sensitive endpoints?
