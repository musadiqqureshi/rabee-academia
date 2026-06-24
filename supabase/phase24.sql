-- ===========================================================================
-- Rabee Academia — Phase 24: waitlist, course completion, multi class links
-- Idempotent.
-- ===========================================================================
create extension if not exists "uuid-ossp";

-- 1) Email waitlist (AI Career Stack launch).
create table if not exists public.waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null,
  name       text,
  source     text not null default 'ai-career-stack',
  created_at timestamptz not null default now(),
  unique (email, source)
);
alter table public.waitlist enable row level security;
drop policy if exists "waitlist_public_insert" on public.waitlist;
drop policy if exists "waitlist_staff_read"     on public.waitlist;
create policy "waitlist_public_insert" on public.waitlist
  for insert to anon, authenticated with check (true);
create policy "waitlist_staff_read" on public.waitlist
  for select to authenticated using (public.is_admin_or_super());

-- 2) Course completion on enrolments (+ auto certificate eligibility).
alter table public.enrollments add column if not exists completed     boolean not null default false;
alter table public.enrollments add column if not exists completed_at   timestamptz;

-- 3) Multiple class links per class (teacher can add unlimited session links).
create table if not exists public.class_links (
  id            uuid primary key default uuid_generate_v4(),
  enrollment_id uuid references public.enrollments(id) on delete cascade,
  batch_id      uuid references public.batches(id) on delete cascade,
  teacher_id    uuid not null references public.profiles(id),
  label         text,
  url           text not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_class_links_enrollment on public.class_links(enrollment_id);
create index if not exists idx_class_links_batch on public.class_links(batch_id);

alter table public.class_links enable row level security;
drop policy if exists "class_links_teacher" on public.class_links;
drop policy if exists "class_links_staff"   on public.class_links;
drop policy if exists "class_links_student" on public.class_links;

create policy "class_links_teacher" on public.class_links
  for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "class_links_staff" on public.class_links
  for all to authenticated
  using (public.is_admin_or_super()) with check (public.is_admin_or_super());
create policy "class_links_student" on public.class_links
  for select to authenticated using (
    exists (select 1 from public.enrollments e
            where e.id = class_links.enrollment_id and e.student_id = auth.uid())
  );
