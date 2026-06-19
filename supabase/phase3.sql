-- ===========================================================================
-- Rabee Academia — Phase 3a: real enrollment, bank-transfer payments, demos
-- Idempotent. Run AFTER schema.sql + phase2.sql.
-- ===========================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Ensure enrollments has the columns the public enrollment flow needs
--    (works whether the live table came from an older or newer schema).
-- ---------------------------------------------------------------------------
alter table public.enrollments add column if not exists subject_id      uuid references public.subjects(id);
alter table public.enrollments add column if not exists class_type      public.class_type;
alter table public.enrollments add column if not exists student_name    text;
alter table public.enrollments add column if not exists student_email   text;
alter table public.enrollments add column if not exists student_phone   text;
alter table public.enrollments add column if not exists education_level text;
alter table public.enrollments add column if not exists payment_method  public.payment_method;
alter table public.enrollments add column if not exists receipt_url     text;
alter table public.enrollments add column if not exists batch_id        uuid references public.batches(id);
alter table public.enrollments add column if not exists created_at      timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- 2. Demo class requests (free trial booking)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.demo_status as enum ('pending','scheduled','completed','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.demo_requests (
  id              uuid primary key default uuid_generate_v4(),
  requester_id    uuid references public.profiles(id) on delete set null,
  full_name       text not null,
  email           text not null,
  phone           text,
  subject_slug    text,
  subject_name    text,
  education_level text,
  preferred_times text[] not null default '{}',
  message         text,
  status          public.demo_status not null default 'pending',
  meet_link       text,
  scheduled_at    timestamptz,
  assigned_teacher uuid references public.profiles(id),
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_demo_requests_status on public.demo_requests(status);

alter table public.demo_requests enable row level security;

drop policy if exists "demo_public_insert"   on public.demo_requests;
drop policy if exists "demo_owner_read"       on public.demo_requests;
drop policy if exists "demo_staff_all"        on public.demo_requests;

-- Anyone (even anonymous visitors) can submit a demo request.
create policy "demo_public_insert"
  on public.demo_requests for insert to anon, authenticated with check (true);

-- A logged-in requester can see their own requests.
create policy "demo_owner_read"
  on public.demo_requests for select to authenticated using (requester_id = auth.uid());

-- Admins / super admins manage all demo requests.
create policy "demo_staff_all"
  on public.demo_requests for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

drop trigger if exists demo_requests_updated_at on public.demo_requests;
create trigger demo_requests_updated_at before update on public.demo_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Private storage bucket for payment receipts + policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

drop policy if exists "receipts_student_upload" on storage.objects;
drop policy if exists "receipts_student_read"   on storage.objects;
drop policy if exists "receipts_staff_read"      on storage.objects;

-- Students upload into their own folder: receipts/<uid>/<file>
create policy "receipts_student_upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "receipts_student_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

-- Staff can read every receipt for verification.
create policy "receipts_staff_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and (select role from public.profiles where id = auth.uid()) in ('super_admin','admin')
  );
