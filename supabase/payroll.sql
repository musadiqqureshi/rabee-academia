-- =============================================================================
-- Teacher salary / payroll. Run in the Supabase SQL editor (idempotent).
-- Salary = base_amount + per_student_rate × (approved students in the teacher's
-- batches), set individually per teacher. Payments are snapshotted per month.
-- =============================================================================

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- Per-teacher salary configuration.
create table if not exists public.teacher_salary_config (
  teacher_id       uuid primary key references public.profiles(id) on delete cascade,
  per_student_rate integer not null default 0,
  base_amount      integer not null default 0,
  updated_at       timestamptz not null default now()
);

-- Monthly salary payment records (snapshot of count + amount at payment time).
create table if not exists public.salary_payments (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references public.profiles(id) on delete cascade,
  month_year    text not null,                       -- 'YYYY-MM'
  student_count integer not null default 0,
  amount        integer not null default 0,
  status        text not null default 'paid',        -- paid | pending
  note          text,
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  unique (teacher_id, month_year)
);

alter table public.teacher_salary_config enable row level security;
alter table public.salary_payments        enable row level security;

drop policy if exists "salcfg_admin_all"   on public.teacher_salary_config;
drop policy if exists "salcfg_teacher_read" on public.teacher_salary_config;
create policy "salcfg_admin_all" on public.teacher_salary_config
  for all to authenticated using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy "salcfg_teacher_read" on public.teacher_salary_config
  for select to authenticated using (teacher_id = auth.uid());

drop policy if exists "salpay_admin_all"   on public.salary_payments;
drop policy if exists "salpay_teacher_read" on public.salary_payments;
create policy "salpay_admin_all" on public.salary_payments
  for all to authenticated using (public.my_role() in ('admin','super_admin'))
  with check (public.my_role() in ('admin','super_admin'));
create policy "salpay_teacher_read" on public.salary_payments
  for select to authenticated using (teacher_id = auth.uid());
