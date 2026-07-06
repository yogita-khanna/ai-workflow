# Technical Design Specification (DEV-009)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `SystemSettingsController` (`GET /settings`, `PUT /settings`)
- **Services:** `SystemSettingsService`
- **Repositories:** `SystemSettingsRepository` (injects `pg.Pool`)

## 2. Data Layer (PostgreSQL Raw SQL)
### Schema (`system_settings` table)
```sql
CREATE TABLE system_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(50) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Queries
- **Fetch:** `SELECT user_id, theme, notifications_enabled, updated_at FROM system_settings WHERE user_id = $1;`
- **Upsert:** `INSERT INTO system_settings (user_id, theme, notifications_enabled) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET theme = EXCLUDED.theme, notifications_enabled = EXCLUDED.notifications_enabled, updated_at = CURRENT_TIMESTAMP RETURNING *;`

## 3. Security & Validation (Zero-Trust)
### Authentication
- Must require a valid JWT (`@UseGuards(JwtAuthGuard)`).
### Validation
- `class-validator` DTOs (`@IsString()`, `@IsBoolean()`).
