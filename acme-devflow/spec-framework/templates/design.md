# Technical Design Specification (Strict Implementation)

_INSTRUCTION TO ARCHITECT: This document dictates exact implementation bounds. Any deviation during the implementation phase requires a formal delta-spec. NO ORMS ALLOWED. Use raw pg queries._

## Metadata

- Ticket/Feature: <Ticket ID>
- Architect: <Architect Agent Role>
- Status: Draft / Approved (Checkpoint #2)
- Related Spec: [SPEC.md](file:///path/to/spec.md)
- ADR References: [ADR-001](file:///path/to/adr.md)

## 1. Traceability Map

_Map Spec Acceptance Criteria to Technical Components:_

- [ ] AC-1 (e.g., login validation) -> Covered in Section 3 (DTOs) & Section 2 (SQL index)
- [ ] AC-2 (e.g., auth session) -> Covered in Section 3 (Guards & JWT Cookies)

## 2. Architecture & DI Boundaries (NestJS)

_Define the exact module hierarchy and Dependency Injection graph._

- **Controllers:** [List new endpoints, HTTP methods, route paths, and decorator guards]
- **Services:** [List core business logic providers]
- **Repositories:** [List providers interacting directly with `pg.Pool`]

## 3. Data Layer (PostgreSQL Raw SQL)

_Define the exact pure `.sql` scripts for `node-pg-migrate`._

### UP Migration

```sql
-- MUST INCLUDE CONSTRAINTS (FK, UNIQUE, CHECK, NOT NULL)
```

### DOWN Migration

```sql
-- MUST FULLY REVERT UP MIGRATION WITHOUT DROPPING UNINTENDED DATA
-- Document any data loss risks or safety mechanisms.
```

### Indexing & Performance Strategy

- [ ] B-Tree Index required on: `table_name(column)` - Reason: [Prevent full-table scans on query paths]
- [ ] No indexes required - Reason: [Explain]

## 4. Security & Validation (Zero-Trust)

### DTOs (Data Transfer Objects)

_Define request payloads using `class-validator` strict typing._

- **Payload Schema:** [Define exact fields, types, and validation rules (e.g., `@IsEmail()`, `@MaxLength()`)]

### Authentication & RBAC

- **Guards:** [List specific guards applied: e.g., `@UseGuards(JwtAuthGuard, RolesGuard)`]
- **Decorators:** [List specific roles/permissions: e.g., `@Roles('admin')`, `@RequirePermission('write:users')`]

### Rate Limiting

- **Throttler Configuration:** [Specify limit per window for new endpoints]

## 5. Frontend Layer (Next.js App Router)

### Component Boundaries

- **Server Components (RSC):** [Which components fetch data securely on the server?]
- **Client Components (`"use client"`):** [Which components require React state/interactivity? Note: NEVER pass sensitive data as props to Client Components]

### Route Protection & Middleware

- **Middleware:** [Define exactly how `middleware.ts` intercepts requests for this route]

## 6. Observability

- **Error Handling:** How do controllers handle failures? (Must throw specific domain exceptions mapped to HttpExceptions).
- **Logging:** What critical paths require `Logger.log()` or `Logger.error()`? (Sanitize any PII or credentials before logging).
