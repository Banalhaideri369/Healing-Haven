# Ban Al-Haidari Energy Healing

A React/Vite healing and courses storefront backed by an Express API, Firebase Auth, Stripe checkout, and PostgreSQL.

## GitHub Backup

The project is backed up to **https://github.com/Banalhaidari369/Healing-Haven** (private repo).

To push the latest code to GitHub, run:
```bash
bash scripts/push-to-github.sh
```

**Setup (already done):**
- `GITHUB_TOKEN` Replit secret — classic PAT with `repo` scope for user `Banalhaideri369`
- Git remote `origin` points to the correct GitHub URL
- A `credential.helper` in `.git/config` reads `GITHUB_TOKEN` at push time — no manual password entry needed

**Note:** The GitHub username in the remote URL is `Banalhaideri369` (ends in **eri**, not **ari**) — keep this spelling exact.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the workspace dependencies
- `pnpm --filter @workspace/ban-al-haidari run dev` — run the frontend locally (Vite port 3000 by default)
- `PORT=20880 BASE_PATH=/ pnpm --filter @workspace/ban-al-haidari run dev` — run the Replit preview frontend
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000 by default)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Replit setup

- The `Start application` workflow runs the frontend on port `20880` for the Replit preview.
- The frontend build and API bundle complete successfully with the imported code.
- The frontend currently calls the deployed API at `https://healing-haven.onrender.com/api`.
- API routes that access PostgreSQL require the Replit-managed `DATABASE_URL`.
- Firebase Auth and Stripe-backed flows require their corresponding Firebase and Stripe configuration; no substitute values are configured.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ban-al-haidari/` — React/Vite storefront and user/admin pages
- `artifacts/api-server/` — Express API routes and server entry point
- `lib/db/src/schema/` — Drizzle PostgreSQL schema
- `lib/api-spec/openapi.yaml` — API contract source
- `artifacts/ban-al-haidari/src/index.css` — frontend theme tokens and global styles

## Architecture decisions

- Firebase Auth remains the identity provider; application data is stored in PostgreSQL through Drizzle.
- The frontend and API remain separate workspace artifacts to match the imported deployment architecture.
- The Replit preview uses the existing frontend artifact port and does not replace the external production API configuration.

## Product

- Public healing services, courses, workshops, testimonials, products, and booking flows
- Firebase-authenticated user profiles and booking history
- Admin dashboard for courses, bookings, banners, testimonials, users, push notifications, and site settings

## User preferences

_No project-specific preferences recorded._

## Gotchas

- Do not invent database, Firebase, or Stripe credentials; configure them as Replit environment variables or secrets before testing those flows.
- Keep the frontend API base URL and the deployed API contract aligned when changing environments.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
