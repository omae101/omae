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

Copy `.env.local.example` to `.env.local` and fill in:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

The `postgres-js` client requires `ssl: "require"` for Supabase — already set in `src/db/index.ts`.

## Architecture

Single-page lead capture form backed by Supabase (PostgreSQL via Drizzle ORM).

- `src/app/page.tsx` — Client component: form UI, validation, phone auto-formatting (XXX-XXXX-XXXX), submit to API
- `src/app/api/leads/route.ts` — POST handler: validates required fields, inserts row via Drizzle
- `src/db/schema.ts` — Drizzle schema for the `leads` table (name, company, email, phone, inquiry_type, message, created_at)
- `src/db/index.ts` — Drizzle client singleton using `postgres-js` with SSL

Migrations are generated into `/drizzle/` (git-ignored). After schema changes, run `db:generate` then apply via `db:migrate` or paste the generated SQL into Supabase SQL Editor.
