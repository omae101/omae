# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

npm run db:generate  # Generate Drizzle migration files from schema changes
npm run db:migrate   # Apply migrations to database (requires DATABASE_URL env var)
npm run db:studio    # Open Drizzle Studio GUI
```

`db:migrate` does not auto-load `.env.local` — set `DATABASE_URL` manually or use a `.env` file (excluded from git).

## Environment

Copy `.env.local.example` to `.env.local` and fill in all three variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- `DATABASE_URL` — used only by Drizzle for migrations (`db:*` scripts)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — used by the Supabase JS client in all API routes

## Architecture

Single-page lead capture form + admin dashboard, backed by Supabase (PostgreSQL).

**Two separate database clients coexist:**
- `src/db/index.ts` — Drizzle ORM client (`postgres-js` with SSL). Used only for schema definition and migrations, not at runtime.
- `src/lib/supabase.ts` — Supabase JS client (`@supabase/supabase-js`). Used by all API routes for reads/writes.

**Pages:**
- `src/app/page.tsx` — Lead capture form (client component). Handles validation, phone auto-formatting, submits to `POST /api/leads`.
- `src/app/admin/page.tsx` — Admin dashboard (client component). Lists all leads with search, edit, delete, and manual refresh.

**API routes** (all use Supabase JS client):
- `POST /api/leads` — insert new lead
- `GET /api/leads?q=...` — list leads, optional search across name/email/company
- `PUT /api/leads/[id]` — update lead fields
- `DELETE /api/leads/[id]` — delete lead

**Schema** (`src/db/schema.ts`): `leads` table with `id`, `name`, `company`, `email`, `phone`, `inquiry_type`, `message`, `created_at`. Email has a unique constraint.

**Supabase RLS** is disabled on the `leads` table — required for the publishable key to have read/write access without additional policies.

Migrations are generated into `/drizzle/` (git-ignored). After schema changes, run `db:generate` then apply via `db:migrate` or paste the generated SQL into Supabase SQL Editor.
