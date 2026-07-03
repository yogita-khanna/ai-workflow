# Product Proposal Specification (DEV-002: User Avatar Uploads)

## 1. Problem Statement & Business Value
Users need the ability to upload a profile picture to personalize their accounts. This increases user engagement and platform trust.

## 2. High-Level Solution Architecture
Next.js will use a Client Component for file selection, which passes a `FormData` object to a Next.js Server Action. The Server Action forwards the stream to a NestJS endpoint. NestJS validates the MIME type and uploads the file to AWS S3, returning the secure URL.

## 3. Scope Boundaries
- **In Scope:** JPEG/PNG uploads under 5MB. S3 bucket integration. Updating the `users` table.
- **Out of Scope:** Image cropping/resizing on the client.

## 4. Production Rollback Strategy (MANDATORY)
- [x] Backward Compatible Database Migration (`avatar_url` is nullable).

## 5. Scaling & Performance Impact
- **Database:** None.
- **Frontend Cache:** We must call `revalidatePath('/profile')` after a successful upload so the new avatar displays instantly.

## 6. Ticket Classification Score
- **Risk:** Medium - File uploads carry malware risks.
- **Reversibility:** High - Column can be dropped or ignored.
- **Precedent:** No.
- **Final Verdict:** `[ask-human]`
