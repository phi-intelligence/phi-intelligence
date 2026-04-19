# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phi Intelligence corporate website and platform. Full-stack TypeScript application with React frontend (Vite SPA) and Express backend, deployed to AWS Amplify (frontend) and Docker (backend).

## Commands

All commands run from `phi_intelligence/`:

```bash
npm run dev              # Start dev server (Express + Vite HMR, port 5000)
npm run build            # Build frontend with Vite
npm run build:client:prod # Production frontend build (used by Amplify)
npm run check            # TypeScript type checking (tsc)
npm run start:prod       # Start production server
npm run db:push          # Push schema changes to database (Drizzle Kit)
npm run db:generate      # Generate migration files
npm run security:check   # Run tsc type checking
```

No test framework or linter is configured.

## Architecture

### Monorepo Layout

```
phi_intelligence/
├── client/src/          # React SPA (Vite, port 5180 in dev)
│   ├── App.tsx          # Root component - all routes defined here
│   ├── pages/           # Route components (home, services/*, admin/*, etc.)
│   ├── components/
│   │   ├── ui/          # Shadcn/ui components (New York style)
│   │   ├── layout/      # Navigation, Footer
│   │   ├── three/       # Three.js 3D components
│   │   └── voice/       # Voice interaction components
│   ├── contexts/        # AdminContext (auth state), VoiceContext
│   ├── services/        # ChatbotService (OpenAI), voiceService (LiveKit)
│   ├── hooks/           # Custom hooks (monitoring, logging, accessibility, three cleanup)
│   └── lib/             # queryClient, utilities
├── server/
│   ├── index.ts         # Express app setup, middleware chain
│   ├── routes.ts        # All API route definitions (~1274 lines, single file)
│   ├── database.ts      # Drizzle ORM connection (Neon PostgreSQL)
│   ├── middleware/       # adminAuth (JWT + RBAC), cors
│   ├── services/        # authService, newsScheduler, rssAggregator, r2StorageService
│   └── utils/jwt.ts     # Token generation/verification
├── shared/
│   └── schema.ts        # Drizzle schema + Zod validators (single source of truth for DB types)
└── migrations/          # Drizzle migration files
```

### Key Architectural Decisions

- **Routing**: Wouter (lightweight, not React Router). All routes in `client/src/App.tsx`.
- **State**: React Query for server state, React Context for client state (auth, voice).
- **Database**: Drizzle ORM with Neon serverless PostgreSQL. Schema in `shared/schema.ts` generates both DB types and Zod validation schemas.
- **Auth**: JWT access/refresh tokens via Jose. Admin routes protected by `AuthGuard` component (client) and `adminAuthMiddleware` (server). Role-based access via `requireRole()`.
- **Styling**: Tailwind CSS with custom CSS variables (phi-black, phi-white, phi-gray, phi-light). Dark theme always active. Shadcn/ui components.
- **3D**: Three.js via React Three Fiber and Drei. Chunks split in Vite config to avoid bundle bloat.
- **Voice/AI**: LiveKit for real-time voice, OpenAI (gpt-4o-mini) for chat. Voice framework lazy-loaded only on voice pages.

### Import Aliases (Vite)

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@three/*` → `client/src/components/three/*`
- `@config/*` → `client/src/config/*`
- `@assets/*` → `attached_assets/*`

### Deployment

- **Frontend**: AWS Amplify (builds from `amplify.yml` in repo root). SPA with fallback to `/index.html`. Static assets cached immutably; HTML never cached.
- **Backend**: Docker (Node 20 Alpine, port 5000). Health check at `/health`.
- **Install**: `npm ci --legacy-peer-deps` (required due to peer dependency conflicts).

### Environment Variables

- `DATABASE_URL` — Neon PostgreSQL connection string (required for server/db commands)
- `VITE_API_URL` — Backend API endpoint for frontend
- `VITE_ALLOWED_ORIGINS` — CORS allowed origins
- `NODE_ENV` — development/production
- `PORT` — Server port (default 5000)
- `TMS_API_URL` — Phi-TMS FastAPI base URL for the employee portal proxy (`/api/tms` → e.g. `http://127.0.0.1:6000`). Run TMS on a different port than Express (see `Phi-TMS/RUN.md`), then `python3 -m app.scripts.seed` in `Phi-TMS/backend` for dev users.

### Employee portal (Phi-TMS)

The marketing site links to `/employee/login`. The Express app proxies authenticated requests to Phi-TMS at `TMS_API_URL` (see `server/index.ts`). Only the **Phi-TMS backend** must run for the portal; the standalone `Phi-TMS/frontend` app is optional reference UI.
