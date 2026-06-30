-- =============================================================================
-- Monthly fee system: per-student discounts. Auto-invoicing + reminders run from
-- the cron routes (/api/cron/*) using the existing `invoices` table with
-- category 'monthly_fee'. Run in the Supabase SQL editor (idempotent).
-- =============================================================================

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- A per-student (optionally per-subject) discount applied to monthly fees.
-- subject_id NULL = applies to all of that student's subjects.
create table if not exists public.student_fee_discounts (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles(id) on delete cascade,
  subject_id   uuid references public.subjects(id) on delete cascade,
  discount_pct integer not null default 0 check (discount_pct between 0 and 100),
  note         text,
  created_at   timestamptz not null default now(),
  unique (student_id, subject_id)
);

alter table public.student_fee_discounts enable row level security;

drop policy if exists "discount_admin_all"   on public.student_fee_discounts;
drop policy if exists "discount_student_read" on public.student_fee_discounts;
create policy "discount_admin_all" on public.student_fee_discounts
  for all to authenticated using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy "discount_student_read" on public.student_fee_discounts
  for select to authenticated using (student_id = auth.uid());
