# Product Proposal Specification (DEV-003: Fix Admin N+1 Query)

## 1. Problem Statement & Business Value
The `/admin/users` dashboard takes >4 seconds to load when there are more than 1,000 users. The logs show an N+1 query issue where the database is queried once for the user list, and then 1,000 individual times to fetch the roles for each user.

## 2. High-Level Solution Architecture
Refactor the NestJS `UsersRepository` to use a single `LEFT JOIN` or bulk `WHERE id IN (...)` raw SQL query instead of querying in a loop.

## 3. Scope Boundaries
- **In Scope:** Refactoring `UsersRepository.findAllWithRoles()`.
- **Out of Scope:** Pagination (already implemented).

## 4. Production Rollback Strategy (MANDATORY)
- [x] Feature Flag N/A (Code refactoring only).
- [x] Revert PR if latency spikes.

## 5. Scaling & Performance Impact
- **Database:** Drops query count from 1,001 queries per request down to 1 query. Huge latency reduction.
- **Frontend Cache:** None.

## 6. Ticket Classification Score
- **Risk:** Low - Purely a read-only query optimization.
- **Reversibility:** High - Easy Git revert.
- **Precedent:** Yes (Standard SQL joins).
- **Final Verdict:** `[auto-apply]` (Agent can self-merge).
