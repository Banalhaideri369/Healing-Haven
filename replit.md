# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

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

- `pnpm dev` — run the frontend workspace app
- `pnpm api:dev` — run the API server
- `pnpm db:push` — apply the Drizzle schema to the development database
- `pnpm db:seed` — add starter courses only when the corresponding catalog tables are empty
- `pnpm db:seed:testimonials` — replace testimonials with the scripted testimonial data
- `pnpm run build` — build all workspace packages
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
