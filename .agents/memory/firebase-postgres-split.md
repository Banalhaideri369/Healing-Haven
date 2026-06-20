---
name: Firebase vs PostgreSQL architecture split
description: Which services use Firebase vs PostgreSQL — the deliberate split and why.
---

# Firebase vs PostgreSQL Split

## The Rule
- **Firebase Auth only** — sign-in, sign-up, password reset, ID token verification.
- **Neon PostgreSQL (Drizzle) for all data** — courses, bookings, user_profiles, banners, testimonials, site_settings, push_subscriptions.
- **Firebase Storage** — never used; ignore.
- **Firebase Firestore** — fully removed. No code should ever import from `firebase/firestore`.

## Why
The hybrid Firestore + PostgreSQL setup caused 403 permission errors on the Admin Dashboard because Firestore security rules blocked server-side reads, and routing conflicts arose from data living in two places. Unified to PostgreSQL as the single source of truth.

## How to apply
- `firebase.ts` exports only `app` and `auth` (no `db`).
- `userProfile.ts` calls `/api/profile` (requireAuth) and `/api/profile/activity`.
- `AdminDashboard.tsx` Users tab calls `apiGetUsers()` → `GET /api/admin/users` (requireAdmin).
- API admin auth: `adminAuth.ts` → `verifyToken()` uses Firebase identitytoolkit REST API, returns `{ uid, email }`. Both `req.userId` and `req.userEmail` are attached to requests.
- New `user_profiles` table in PostgreSQL (uid PK, email, display_name, bio, intention, phone, recent_activity jsonb, timestamps).
- API route file: `artifacts/api-server/src/routes/profiles.ts`.

## What kept Firebase Auth
- Admin token verification uses `identitytoolkit.googleapis.com/v1/accounts:lookup` (no SDK needed server-side).
- Client still calls `auth.currentUser.getIdToken()` in `api.ts` → `adminHeaders()` for all protected API calls.
