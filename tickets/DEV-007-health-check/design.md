# Technical Design Specification (DEV-007)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `HealthController` (`GET /health`)
- **Services:** `HealthService`
- **Repositories:** `HealthRepository` (injects `pg.Pool`)

## 2. Data Layer (PostgreSQL Raw SQL)
### Query
```sql
SELECT 1 AS status;
```

## 3. Security & Validation (Zero-Trust)
### Authentication
- Must be a public route to allow external monitoring services (like Datadog/AWS) to ping it without a JWT.
