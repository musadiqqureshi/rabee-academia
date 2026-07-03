-- =============================================================================
-- Need-based scholarship program. Run in the Supabase SQL editor (idempotent).
-- Approved scholarships become a fixed-amount monthly fee discount on the
-- student's account, so the monthly-invoice generator bills the reduced amount.
-- =============================================================================

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- Extend the existing discount table to support a fixed PKR amount + expiry
-- (scholarships grant a fixed monthly reduction, not just a percentage).
alter table public.student_fee_discounts add column if not exists discount_amount integer;
alter table public.student_fee_discounts add column if not exists valid_until date;

-- Applications.
create table if not exists public.scholarship_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles(id) on delete cascade,
  full_name       text not null,
  email           text not null,
  phone           text,
  subject_slug    text,
  subject_name    text,
  monthly_income  integer,
  household_size  integer,
  reason          text,
  document_url    text,
  status          text not null default 'submitted', -- submitted | under_review | approved | rejected | waitlisted
  awarded_amount  integer,                            -- fixed PKR off per month (on approval)
  valid_until     date,
  admin_notes     text,
  reviewed_by     uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_scholarship_status on public.scholarship_applications(status);

alter table public.scholarship_applications enable row level security;

drop policy if exists "schol_owner_select" on public.scholarship_applications;
drop policy if exists "schol_owner_insert" on public.scholarship_applications;
drop policy if exists "schol_owner_update" on public.scholarship_applications;
drop policy if exists "schol_admin_all"    on public.scholarship_applications;

create policy "schol_owner_select" on public.scholarship_applications
  for select to authenticated using (user_id = auth.uid());
create policy "schol_owner_insert" on public.scholarship_applications
  for insert to authenticated with check (user_id = auth.uid());
create policy "schol_owner_update" on public.scholarship_applications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "schol_admin_all" on public.scholarship_applications
  for all to authenticated using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));

-- Private bucket for supporting documents (admins read via signed URLs).
insert into storage.buckets (id, name, public)
values ('scholarship-docs', 'scholarship-docs', false)
on conflict (id) do nothing;

create or replace function public.touch_scholarship() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_touch_scholarship on public.scholarship_applications;
create trigger trg_touch_scholarship before update on public.scholarship_applications
  for each row execute function public.touch_scholarship();
