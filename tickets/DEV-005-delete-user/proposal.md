# Product Proposal Specification (DEV-005: Delete User)

## 0. ARCHITECTURAL VIOLATION DETECTED
**ALERT:** The prompt requested the use of `Prisma ORM`. 
According to Section 4 of `CLAUDE.md` (`Database & Data Access Layer`), **all ORMs (including Prisma and TypeORM) are strictly banned.** We must use the raw `pg` driver with parameterized queries. Prisma will NOT be used for this feature.

## 1. Problem Statement & Business Value
Users must have the ability to delete their accounts to comply with GDPR/CCPA data privacy regulations.

## 2. High-Level Solution Architecture
A Next.js Server Action will call the NestJS `/users/me` DELETE endpoint. NestJS will execute a raw SQL `DELETE` query, which will cascade and delete all associated `password_reset_tokens` and `refresh_tokens`.

## 3. Scope Boundaries
- **In Scope:** Hard deletion of the user record and cascaded related records.
- **Out of Scope:** Soft deletes (no `deleted_at` columns for GDPR compliance).

## 4. Production Rollback Strategy (MANDATORY)
- [x] Feature Flag N/A
- [x] Other: Once a user is hard-deleted, it cannot be rolled back. We will enforce a UI confirmation modal (type "DELETE" to confirm).

## 5. Ticket Classification Score
- **Risk:** High - Destructive database operation.
- **Reversibility:** Low - Data is permanently lost.
- **Final Verdict:** `[ask-human]`
