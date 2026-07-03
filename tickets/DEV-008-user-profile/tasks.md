# Implementation Checklist (Strict DAG)

## Phase 1: Database Migration
- [ ] 1.1 Create up/down migrations for `users` table.

## Phase 2: Data Access Layer
- [ ] 2.1 Write Jest Unit Test for `UserProfileRepository` mocking `pg.Pool`. **[RED]**
- [ ] 2.2 Implement `UserProfileRepository` with raw SQL queries. **[GREEN]**

## Phase 3: Service Layer
- [ ] 3.1 Write Jest Unit Test for `UserProfileService`. **[RED]**
- [ ] 3.2 Implement `UserProfileService`. **[GREEN]**

## Phase 4: Controller Layer
- [ ] 4.1 Write Jest Unit Test for `UserProfileController`. **[RED]**
- [ ] 4.2 Implement `UserProfileController` with validation DTOs. **[GREEN]**
