# Technical Design Specification (DEV-002)

## 1. Architecture & DI Boundaries (NestJS)
- **Controllers:** `UsersController` (`POST /users/me/avatar`)
- **Services:** `UsersService`, `StorageService` (AWS S3)
- **Repositories:** `UsersRepository`

## 2. Data Layer (PostgreSQL Raw SQL)
### UP Migration
```sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(1024) NULL;
```
### DOWN Migration
```sql
ALTER TABLE users DROP COLUMN avatar_url;
```

## 3. Security & Validation (Zero-Trust)
### DTOs
NestJS `ParseFilePipe` with `MaxFileSizeValidator` (5MB) and `FileTypeValidator` (image/jpeg, image/png).
### Authentication
`@UseGuards(JwtAuthGuard)` - only the authenticated user can upload to their own profile.

## 4. Frontend Layer (Next.js App Router)
### Component Boundaries
- **Server Actions:** `uploadAvatarAction(formData: FormData)` in `actions/user.actions.ts`.
- **Client Components:** `<AvatarUploader />` ("use client") handling the `<input type="file">`.
