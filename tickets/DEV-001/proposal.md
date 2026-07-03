# Product Proposal Specification (DEV-001: RBAC + Auth)

## 1. Problem Statement & Business Value
The Acme SaaS platform requires a secure authentication and authorization system to protect user data and restrict administrative actions. We need a zero-trust architecture.

## 2. High-Level Solution Architecture
Next.js App Router will serve the login UI. NestJS will issue HttpOnly cookies containing short-lived Argon2 hashed JWT access tokens and rotatable refresh tokens.

## 3. Scope Boundaries
- **In Scope:** Login, Logout, Token Refresh, Role-based route guards (`RolesGuard`).
- **Out of Scope:** OAuth/SSO, Password Reset flows.

## 4. Production Rollback Strategy (MANDATORY)
- [x] Backward Compatible Database Migration (Adding new tables, not modifying existing data).

## 5. Scaling & Performance Impact
- **Database:** Indexes added to `users.email` to prevent full table scans during login.
- **Frontend Cache:** The `/dashboard` route will opt-out of the Next.js static cache since it depends on the authenticated user cookie.

## 6. Ticket Classification Score
- **Risk:** High - Core security infrastructure.
- **Reversibility:** Medium - Schema additions.
- **Precedent:** No.
- **Final Verdict:** `[ask-human]`
