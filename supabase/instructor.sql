-- =============================================================================
-- Instructor application + AI screening test system
-- Run this in the Supabase SQL editor. Safe to re-run (idempotent-ish).
-- =============================================================================

-- ---- Applications -----------------------------------------------------------
create table if not exists public.instructor_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  phone           text,
  subject_slug    text,
  subject_name    text not null,
  qualifications  text,
  code            text unique not null,
  fee_amount      integer not null default 1000,
  payment_method  text,
  receipt_url     text,
  payment_status  text not null default 'pending',   -- pending | verified | rejected
  status          text not null default 'submitted', -- submitted | payment_submitted | test_unlocked | test_submitted | qualified | not_qualified | interview_scheduled | hired | rejected
  score           numeric,
  passed          boolean,
  interview_at    timestamptz,
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- One application per user.
create unique index if not exists idx_instructor_app_user on public.instructor_applications(user_id);
create index if not exists idx_instructor_app_status on public.instructor_applications(status);

-- ---- Tests (answer key lives here; candidates can write but NOT read) --------
create table if not exists public.instructor_tests (
  id            uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.instructor_applications(id) on delete cascade,
  questions     jsonb not null default '{}'::jsonb,  -- full: { mcqs:[{q,options,answer,explanation}], long:[{prompt}] }
  mcq_answers   jsonb,                                -- candidate's chosen indices
  long_answers  jsonb,                                -- candidate's essay answers
  mcq_score     numeric,
  long_score    numeric,
  total_score   numeric,
  ai_feedback   text,
  status        text not null default 'generated',    -- generated | submitted | graded
  generated_at  timestamptz not null default now(),
  submitted_at  timestamptz
);

-- ---- RLS --------------------------------------------------------------------
alter table public.instructor_applications enable row level security;
alter table public.instructor_tests        enable row level security;

-- Helper: current user's role (avoids recursive policy lookups).
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- Applications: owner can see/insert/update their own; admins manage all.
drop policy if exists "instr_app_owner_select" on public.instructor_applications;
drop policy if exists "instr_app_owner_insert" on public.instructor_applications;
drop policy if exists "instr_app_owner_update" on public.instructor_applications;
drop policy if exists "instr_app_admin_all"    on public.instructor_applications;

create policy "instr_app_owner_select" on public.instructor_applications
  for select to authenticated using (user_id = auth.uid());
create policy "instr_app_owner_insert" on public.instructor_applications
  for insert to authenticated with check (user_id = auth.uid());
create policy "instr_app_owner_update" on public.instructor_applications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "instr_app_admin_all" on public.instructor_applications
  for all to authenticated using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));

-- Tests: the candidate may INSERT/UPDATE their own row (write answers) but may
-- NOT SELECT it — that would leak the answer key. Generation + grading happen
-- server-side with the service role, which bypasses RLS. Admins can read all.
drop policy if exists "instr_test_owner_insert" on public.instructor_tests;
drop policy if exists "instr_test_owner_update" on public.instructor_tests;
drop policy if exists "instr_test_admin_select" on public.instructor_tests;
drop policy if exists "instr_test_admin_all"    on public.instructor_tests;

create policy "instr_test_owner_insert" on public.instructor_tests
  for insert to authenticated with check (
    exists (select 1 from public.instructor_applications a
            where a.id = application_id and a.user_id = auth.uid()));
create policy "instr_test_owner_update" on public.instructor_tests
  for update to authenticated using (
    exists (select 1 from public.instructor_applications a
            where a.id = application_id and a.user_id = auth.uid()));
create policy "instr_test_admin_all" on public.instructor_tests
  for all to authenticated using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));

-- Keep updated_at fresh on applications.
create or replace function public.touch_instructor_app() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_touch_instructor_app on public.instructor_applications;
create trigger trg_touch_instructor_app before update on public.instructor_applications
  for each row execute function public.touch_instructor_app();
