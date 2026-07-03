# Technical Design Specification (Strict Implementation)

*INSTRUCTION TO AGENT: This document dictates exact implementation bounds. Any deviation during the `tdd-loop` requires a formal `delta-spec.md`. NO ORMS ALLOWED. Use raw `pg` queries.*

## 1. Architecture & DI Boundaries (NestJS)
*Define the exact module hierarchy and Dependency Injection graph.*
- **Controllers:** [List new endpoints, HTTP methods, and route paths]
- **Services:** [List core business logic providers]
- **Repositories:** [List providers interacting directly with `pg.Pool`]

## 2. Data Layer (PostgreSQL Raw SQL)
*Define the exact pure `.sql` scripts for `node-pg-migrate`.*
### UP Migration
```sql
-- MUST INCLUDE CONSTRAINTS (FK, UNIQUE, CHECK)
```
### DOWN Migration
```sql
-- MUST FULLY REVERT UP MIGRATION WITHOUT DROPPING UNINTENDED DATA
```
### Indexing Strategy
- [ ] B-Tree Index required on: `table_name(column)` - Reason: [Why]
- [ ] No indexes required.

## 3. Security & Validation (Zero-Trust)
### DTOs (Data Transfer Objects)
*Define request payloads using `class-validator` strict typing.*
- **Payload Schema:** [Define exact fields, types, and validation rules (e.g., `@IsEmail()`, `@MaxLength()`)]
### Authentication & RBAC
- **Guards:** [List specific guards applied: e.g., `@UseGuards(JwtAuthGuard, RolesGuard)`]
- **Decorators:** [List specific permissions required: e.g., `@RequirePermission('write:users')`]
### Rate Limiting
- **Throttler Configuration:** [Specify limit per window for new endpoints]

## 4. Frontend Layer (Next.js App Router)
### Component Boundaries
- **Server Components (RSC):** [Which components fetch data securely on the server?]
- **Client Components (`"use client"`):** [Which components require React state/interactivity? Note: NEVER pass sensitive data as props to Client Components]
### Route Protection
- **Middleware:** [Define exactly how `middleware.ts` intercepts requests for this route]

## 5. Observability
- **Error Handling:** How do controllers handle failures? (Must throw specific `HttpException` classes).
- **Logging:** What critical paths require `Logger.log()` or `Logger.error()`?
