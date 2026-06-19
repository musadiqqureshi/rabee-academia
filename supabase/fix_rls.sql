-- =============================================================================
-- Rabee Academia — RLS Fix + Missing Tables
-- Run in Supabase SQL Editor. Safe to re-run (fully idempotent).
--
-- Fixes:
--   1. Infinite recursion in profiles RLS policies
--   2. Creates demo_requests table (needed for /demo page)
--   3. Creates invoices table (needed for enrollment flow)
--   4. Fixes all role-checking policies across all tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Nuclear drop — remove EVERY existing policy on every affected table so
--    subsequent CREATE POLICY statements always succeed on re-runs.
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  -- public schema tables
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles','subjects','batches','enrollments',
        'payments','materials','attendance','notifications',
        'demo_requests','invoices','schedules'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;

  -- storage.objects — only drop policies that reference our buckets
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (
        policyname ilike '%receipt%'
        or policyname ilike '%material%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Security-definer helpers — bypass RLS for cross-table lookups so
--    policies never form circular query chains (which cause infinite recursion).
-- ---------------------------------------------------------------------------

-- Returns the caller's role without triggering profiles RLS.
create or replace function public.get_my_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- Checks if the given batch belongs to the calling teacher.
-- Scalar boolean — safe to use in policy USING clauses.
create or replace function public.i_teach_this_batch(p_batch_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists(
    select 1 from public.batches where id = p_batch_id and teacher_id = auth.uid()
  );
$$;

-- Checks if the calling student has an approved enrollment in the given batch.
-- Scalar boolean — safe to use in policy USING clauses.
create or replace function public.i_am_enrolled_in_batch(p_batch_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists(
    select 1 from public.enrollments
    where batch_id = p_batch_id and student_id = auth.uid() and status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Profiles — recreated cleanly using get_my_role() (no recursion).
-- ---------------------------------------------------------------------------

-- Any authenticated user can read their own profile row.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins and super-admins can read all profiles (uses helper, not recursive).
create policy "profiles_select_staff"
  on public.profiles for select
  using (public.get_my_role() in ('admin','super_admin'));

-- Anyone can update their own profile.
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Super-admins can update any profile (e.g. role changes).
create policy "profiles_update_super_admin"
  on public.profiles for update
  using (public.get_my_role() = 'super_admin');

-- ---------------------------------------------------------------------------
-- 3. Subjects
-- ---------------------------------------------------------------------------

create policy "subjects_public_read"
  on public.subjects for select
  using (is_active = true);

create policy "subjects_admin_all"
  on public.subjects for all
  using (public.get_my_role() in ('super_admin','admin'));

-- ---------------------------------------------------------------------------
-- 4. Batches
-- ---------------------------------------------------------------------------

create policy "batches_staff_read"
  on public.batches for select
  using (public.get_my_role() in ('super_admin','admin','teacher'));

create policy "batches_admin_write"
  on public.batches for all
  using (public.get_my_role() in ('super_admin','admin'));

-- Students read batches they are enrolled in — scalar boolean helper
-- avoids the batches→enrollments→batches recursion cycle.
create policy "batches_student_read"
  on public.batches for select
  using (public.i_am_enrolled_in_batch(id));

-- ---------------------------------------------------------------------------
-- 5. Enrollments
-- ---------------------------------------------------------------------------

-- Students: full access to their own rows (read + insert + update)
create policy "enrollments_student_own"
  on public.enrollments for all
  using (student_id = auth.uid());

-- Admins: full access to all enrollments
create policy "enrollments_staff_all"
  on public.enrollments for all
  using (public.get_my_role() in ('super_admin','admin'));

-- Teachers: read enrollments in their batches — scalar boolean helper
-- avoids the enrollments→batches→enrollments recursion cycle.
create policy "enrollments_teacher_read"
  on public.enrollments for select
  using (public.i_teach_this_batch(batch_id));

-- ---------------------------------------------------------------------------
-- 6. Payments
-- ---------------------------------------------------------------------------

create policy "payments_student_own"
  on public.payments for select
  using (student_id = auth.uid());

-- Students can also INSERT their own payment records (enrollment flow)
create policy "payments_student_insert"
  on public.payments for insert
  with check (student_id = auth.uid());

create policy "payments_staff_all"
  on public.payments for all
  using (public.get_my_role() in ('super_admin','admin'));

-- ---------------------------------------------------------------------------
-- 7. Materials
-- ---------------------------------------------------------------------------

-- Students read materials for batches they are enrolled in — scalar boolean
-- helper avoids the materials→enrollments→batches→enrollments cycle.
create policy "materials_student_read"
  on public.materials for select
  using (public.i_am_enrolled_in_batch(batch_id));

create policy "materials_teacher_all"
  on public.materials for all
  using (teacher_id = auth.uid());

create policy "materials_admin_read"
  on public.materials for select
  using (public.get_my_role() in ('super_admin','admin'));

-- ---------------------------------------------------------------------------
-- 8. Attendance
-- ---------------------------------------------------------------------------

create policy "attendance_student_own"
  on public.attendance for select
  using (student_id = auth.uid());

create policy "attendance_teacher_all"
  on public.attendance for all
  using (public.i_teach_this_batch(batch_id));

create policy "attendance_admin_read"
  on public.attendance for select
  using (public.get_my_role() in ('super_admin','admin'));

-- ---------------------------------------------------------------------------
-- 9. Notifications
-- ---------------------------------------------------------------------------

create policy "notifications_own"
  on public.notifications for all
  using (user_id = auth.uid());

create policy "notifications_staff_insert"
  on public.notifications for insert
  with check (public.get_my_role() in ('super_admin','admin'));

-- ---------------------------------------------------------------------------
-- 10. Storage policies
-- ---------------------------------------------------------------------------

-- Ensure storage buckets exist
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- receipts: students upload to their own folder, staff read all.
-- split_part is scalar; storage.foldername() is set-returning and banned in policies.
create policy "receipts_student_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text);

create policy "receipts_student_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text);

create policy "receipts_staff_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and public.get_my_role() in ('super_admin','admin'));

-- materials: teachers upload, authenticated users read
create policy "materials_teacher_upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'materials'
    and public.get_my_role() in ('teacher','admin','super_admin')
  );

create policy "materials_authenticated_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'materials');

-- ---------------------------------------------------------------------------
-- 11. demo_requests table (needed for /demo booking page)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.demo_status as enum ('pending','scheduled','completed','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.demo_requests (
  id               uuid primary key default uuid_generate_v4(),
  requester_id     uuid references public.profiles(id) on delete set null,
  full_name        text not null,
  email            text not null,
  phone            text,
  subject_slug     text,
  subject_name     text,
  education_level  text,
  preferred_times  text[] not null default '{}',
  message          text,
  status           public.demo_status not null default 'pending',
  meet_link        text,
  scheduled_at     timestamptz,
  assigned_teacher uuid references public.profiles(id),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.demo_requests enable row level security;

-- Anyone (including anonymous visitors) can submit a demo request
create policy "demo_public_insert"
  on public.demo_requests for insert to anon, authenticated
  with check (true);

-- Logged-in users can see their own requests
create policy "demo_owner_read"
  on public.demo_requests for select to authenticated
  using (requester_id = auth.uid());

-- Admins manage all demo requests (uses get_my_role, no recursion)
create policy "demo_staff_all"
  on public.demo_requests for all to authenticated
  using (public.get_my_role() in ('super_admin','admin'));

drop trigger if exists demo_requests_updated_at on public.demo_requests;
create trigger demo_requests_updated_at
  before update on public.demo_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 12. invoices table (needed for enrollment flow)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.invoice_status as enum ('draft','issued','paid','overdue','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_category as enum ('registration','monthly','other');
exception when duplicate_object then null; end $$;

create table if not exists public.invoices (
  id             uuid primary key default uuid_generate_v4(),
  student_id     uuid not null references public.profiles(id),
  enrollment_id  uuid references public.enrollments(id) on delete cascade,
  subject_id     uuid references public.subjects(id),
  category       public.invoice_category not null default 'registration',
  description    text not null,
  amount_pkr     integer not null,
  status         public.invoice_status not null default 'issued',
  due_date       date,
  paid_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "invoices_student_own"
  on public.invoices for select
  using (student_id = auth.uid());

-- Students can also insert their own invoices (enrollment flow runs server-side)
create policy "invoices_student_insert"
  on public.invoices for insert
  with check (student_id = auth.uid());

create policy "invoices_staff_all"
  on public.invoices for all
  using (public.get_my_role() in ('super_admin','admin'));

-- ---------------------------------------------------------------------------
-- 13. schedules table (needed by student subjects + teacher subjects pages)
-- ---------------------------------------------------------------------------
create table if not exists public.schedules (
  id           uuid primary key default uuid_generate_v4(),
  batch_id     uuid not null references public.batches(id) on delete cascade,
  day_of_week  text not null,
  start_time   text not null,
  end_time     text not null,
  meet_link    text,
  created_at   timestamptz not null default now()
);

alter table public.schedules enable row level security;

create policy "schedules_staff_all"
  on public.schedules for all
  using (public.get_my_role() in ('super_admin','admin','teacher'));

create policy "schedules_student_read"
  on public.schedules for select
  using (public.i_am_enrolled_in_batch(batch_id));

-- ---------------------------------------------------------------------------
-- 14. Seed one default batch per teacher that currently has no batches.
--     Uses the first active subject alphabetically. Idempotent.
-- ---------------------------------------------------------------------------
insert into public.batches (subject_id, teacher_id, class_type, is_active)
select
  (select id from public.subjects where is_active = true order by name limit 1),
  p.id,
  'regular',
  true
from public.profiles p
where p.role = 'teacher'
  and not exists (select 1 from public.batches b where b.teacher_id = p.id);

-- ---------------------------------------------------------------------------
-- 15. Ensure subjects seeded (safe duplicate-skip insert)
-- ---------------------------------------------------------------------------
insert into public.subjects(slug,name,level,regular_price,weekend_price,lessons,description,is_active) values
  ('fsc-physics',      'FSc Physics',         'FSc Level',  7000,  5500, 48,'Complete FSc Physics curriculum.',true),
  ('fsc-chemistry',    'FSc Chemistry',       'FSc Level',  7000,  5500, 44,'In-depth FSc Chemistry.',true),
  ('fsc-biology',      'FSc Biology',         'FSc Level',  7000,  5500, 45,'FSc Biology with diagrams.',true),
  ('fsc-math',         'FSc Mathematics',     'FSc Level',  7000,  5500, 50,'FSc Mathematics.',true),
  ('a-level-physics',  'A Level Physics',     'A Level',   15000, 12000, 58,'Cambridge A Level Physics.',true),
  ('a-level-chemistry','A Level Chemistry',   'A Level',   15000, 12000, 60,'A Level Chemistry.',true),
  ('a-level-math',     'A Level Mathematics', 'A Level',   15000, 12000, 62,'A Level Mathematics.',true),
  ('o-level-math',     'O Level Mathematics', 'O Level',   15000, 12000, 52,'O Level Mathematics.',true),
  ('o-level-physics',  'O Level Physics',     'O Level',   15000, 12000, 50,'O Level Physics.',true),
  ('bs-cs',            'BS Computer Science', 'BS Level',  10000,  8000, 70,'BS Computer Science.',true),
  ('bs-physics',       'BS Physics',          'BS Level',  10000,  8000, 65,'BS Physics.',true),
  ('bs-math',          'BS Mathematics',      'BS Level',  10000,  8000, 65,'BS Mathematics.',true),
  ('ms-cs',            'MS Computer Science', 'MS Level',  18000, 15000, 80,'MS Computer Science.',true),
  ('ms-physics',       'MS Physics',          'MS Level',  18000, 15000, 75,'MS Physics.',true),
  ('ms-math',          'MS Mathematics',      'MS Level',  18000, 15000, 75,'MS Mathematics.',true)
on conflict(slug) do nothing;
