# Technical Design Specification (DEV-011)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `WebhooksController` (`GET /webhooks`, `POST /webhooks`)
- **Services:** `WebhooksService`
- **Repositories:** `WebhooksRepository`

## 2. Data Layer (PostgreSQL Raw SQL)
### Schema (`webhooks` table)
```sql
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Queries
- **Fetch:** `SELECT id, url, event_type FROM webhooks;`
- **Insert:** `INSERT INTO webhooks (url, event_type) VALUES ($1, $2) RETURNING *;`

## 3. Security & Validation (Zero-Trust)
- Must require a valid JWT (`@UseGuards(JwtAuthGuard)`).
- `class-validator` DTOs (`@IsUrl()`, `@IsString()`).
