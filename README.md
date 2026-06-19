# Rabee Academia

Smart online learning platform for FSc, A/O Levels, Oxford curriculum, BS & MS
students — subject enrollment, role-based dashboards, online classes, and fee
collection.

> **Tagline:** Smart Online Learning for Future Achievers

## Run & Operate

A standalone Next.js (App Router) app at the repository root.

- `npm install` — install dependencies
- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- Required env (see `.env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript 5.9
- Tailwind CSS 4 (via `@tailwindcss/postcss`) + shadcn/ui (Radix) components
- Supabase (Auth + Postgres) via `@supabase/ssr`
- Framer Motion, lucide-react, recharts
- Deploy: Vercel (web) + Supabase (backend)

## Where things live

- `app/` — App Router routes
  - `app/page.tsx` — marketing landing page
  - `app/login`, `app/register` — auth screens
  - `app/auth/callback`, `app/auth/signout` — auth route handlers
  - `app/dashboard/{super-admin,admin,teacher,student}` — role dashboards
- `src/components/` — landing sections + `ui/` (shadcn) + `dashboard/` shells
- `src/lib/supabase/` — browser/server/middleware clients + shared types
- `src/lib/auth.ts` — `getProfile()` and `requireRole()` server guards
- `middleware.ts` — session refresh + route protection
- `supabase/schema.sql` — Stage 1 DB schema (profiles, roles, RLS, triggers)

## Architecture decisions

- Next.js App Router enables server-side Supabase auth and per-role
  server-rendered dashboards.
- Roles (`super_admin`, `admin`, `teacher`, `student`) live on the `profiles`
  table and are mirrored into auth metadata; `requireRole()` guards each
  dashboard server-side, and `middleware.ts` blocks unauthenticated access.
- Public sign-up always creates a `student`. Staff roles are provisioned by a
  super admin via the `set_user_role()` SQL function — never self-served.
- RLS: users see their own profile; admins/super-admins see all; only super
  admins can change roles.

## Setup (first run)

1. Create a free Supabase project; copy URL + anon key into `.env.local`.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Register a user, then promote it:
   `select public.set_user_role('you@example.com', 'super_admin');`

## Roadmap

- **Stage 1 (done):** Next.js app, auth, role dashboards (scaffolding).
- **Stage 2:** AssanPay + IBAN payments, enrollment flow, fee management, Meet
  links.
- **Stage 3:** LMS (materials, assignments, quizzes, attendance),
  notifications, reports.
