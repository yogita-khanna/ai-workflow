# Technical Design Specification (DEV-010)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `FeatureFlagsController` (`GET /feature-flags`, `PUT /feature-flags`)
- **Services:** `FeatureFlagsService`
- **Repositories:** `FeatureFlagsRepository` (injects `pg.Pool`)

## 2. Data Layer (PostgreSQL Raw SQL)
### Schema (`feature_flags` table)
```sql
CREATE TABLE feature_flags (
  name VARCHAR(100) PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Queries
- **Fetch:** `SELECT name, is_enabled, updated_at FROM feature_flags;`
- **Upsert:** `INSERT INTO feature_flags (name, is_enabled) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET is_enabled = EXCLUDED.is_enabled, updated_at = CURRENT_TIMESTAMP RETURNING *;`

## 3. Security & Validation (Zero-Trust)
### Authentication
- Must require a valid JWT (`@UseGuards(JwtAuthGuard)`).
### Validation
- `class-validator` DTOs (`@IsString()`, `@IsBoolean()`).
