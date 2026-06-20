# Ban Al-Haidari Energy Healing — Full-Stack Infrastructure

## Architecture Overview

This is a decoupled full-stack application with three independent layers:

```
┌─────────────────────┐     HTTPS / REST API     ┌──────────────────────┐
│   React + Vite      │ ─────────────────────── ▶ │  Node.js + Express   │
│   (Netlify)         │ ◀ ─────────────────────── │  (Render)            │
└─────────────────────┘                           └──────────┬───────────┘
                                                             │ SQL (SSL)
                                                  ┌──────────▼───────────┐
                                                  │  Neon PostgreSQL      │
                                                  │  (Managed DB)         │
                                                  └──────────────────────┘
```

| Layer        | Technology           | Hosting    |
|--------------|----------------------|------------|
| Frontend     | React 19 + Vite      | Netlify    |
| Backend API  | Node.js + Express 5  | Render     |
| Database     | PostgreSQL (Drizzle)  | Neon       |
| Auth         | Firebase Auth        | Firebase   |
| Payments     | Stripe               | —          |

---

## Frontend (Netlify)

### Build Settings
- **Build command**: `pnpm --filter @workspace/ban-al-haidari run build`
- **Publish directory**: `artifacts/ban-al-haidari/dist`
- **Base directory**: `/` (root of the repo)

### Environment Variables
Set these in the Netlify dashboard under **Site Settings → Environment Variables**:

```
VITE_API_BASE_URL=https://your-render-app.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Backend API (Render)

### Build Settings
- **Build command**: `pnpm install && pnpm --filter @workspace/api-server run build`
- **Start command**: `pnpm --filter @workspace/api-server run start`
- **Root directory**: `/` (root of the repo)

### Environment Variables
Set these in the Render dashboard under **Environment**:

```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
STRIPE_SECRET_KEY=sk_live_...
CORS_ORIGIN=https://your-netlify-app.netlify.app
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

---

## Database (Neon PostgreSQL)

The database client connects using `DATABASE_URL` with SSL enabled for production.

### Running Migrations
```bash
pnpm --filter @workspace/db run push
```

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start API server (port 8080 by default)
pnpm --filter @workspace/api-server run dev

# Start frontend dev server
pnpm --filter @workspace/ban-al-haidari run dev
```

Local `.env` files:
- `artifacts/api-server/.env` — backend secrets
- `artifacts/ban-al-haidari/.env` — frontend VITE_ variables
