# Product Proposal Specification (DEV-004: Forgot Password)

## 1. Problem Statement & Business Value
Users who forget their passwords currently have no self-service way to recover their accounts. This causes friction and increases support tickets. We need a secure password reset flow.

## 2. High-Level Solution Architecture
Next.js will provide the "Request Reset" and "New Password" forms via Client Components. NestJS will generate a secure, short-lived reset token, hash it, store it in Postgres, and trigger a mock email. When the user submits the new password, NestJS validates the token and updates the Argon2 password hash.

## 3. Scope Boundaries
- **In Scope:** Token generation, hashing, database storage, validation, password updating, Next.js forms.
- **Out of Scope:** Actual SMTP email delivery (we will log the reset link to the console for now).

## 4. Production Rollback Strategy (MANDATORY)
- [x] Backward Compatible Database Migration (Adding a new `password_reset_tokens` table. Does not impact existing auth flows).

## 5. Scaling & Performance Impact
- **Database:** Negligible. Tokens are indexed by `token_hash`.
- **Frontend Cache:** The `/reset-password` route must be dynamically rendered to read URL search parameters (`?token=xyz`).

## 6. Ticket Classification Score
- **Risk:** High - Core auth/security logic. Token leakage could result in account takeover.
- **Reversibility:** High - Easy to drop the table.
- **Precedent:** No.
- **Final Verdict:** `[ask-human]` (Requires human review before coding).
