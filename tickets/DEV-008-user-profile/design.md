# Technical Design Specification (DEV-008)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `UserProfileController` (`GET /profile`, `PUT /profile`)
- **Services:** `UserProfileService`
- **Repositories:** `UserProfileRepository` (injects `pg.Pool`)

## 2. Data Layer (PostgreSQL Raw SQL)
### Schema (`users` table)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Queries
- **Fetch:** `SELECT id, email, first_name, last_name, avatar_url, created_at, updated_at FROM users WHERE id = $1;`
- **Update:** `UPDATE users SET first_name = $1, last_name = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *;`

## 3. Security & Validation (Zero-Trust)
### Authentication
- Must require a valid JWT (authenticated route).
### Validation
- `class-validator` DTOs for `PUT /profile` to ensure data integrity (e.g. string lengths).
