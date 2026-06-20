-- ===========================================================================
-- Rabee Academia — Phase 4a: unified attendance (batch + date based)
-- Idempotent. Makes the live attendance table compatible with batch/date
-- marking regardless of whether it was created schedule-based.
-- ===========================================================================

do $$ begin
  create type public.attendance_status as enum ('present','absent','late');
exception when duplicate_object then null; end $$;

alter table public.attendance add column if not exists batch_id     uuid references public.batches(id);
alter table public.attendance add column if not exists session_date date;
alter table public.attendance add column if not exists marked_by    uuid references public.profiles(id);
alter table public.attendance add column if not exists notes        text;
alter table public.attendance add column if not exists created_at   timestamptz not null default now();

-- If a legacy schedule_id NOT NULL column exists, relax it so batch-based
-- inserts succeed.
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='attendance' and column_name='schedule_id') then
    begin alter table public.attendance alter column schedule_id drop not null; exception when others then null; end;
  end if;
end $$;

create unique index if not exists attendance_batch_student_date
  on public.attendance(batch_id, student_id, session_date);

alter table public.attendance enable row level security;

drop policy if exists "attendance_student_own"  on public.attendance;
drop policy if exists "attendance_teacher_all"  on public.attendance;
drop policy if exists "attendance_admin_read"   on public.attendance;
drop policy if exists "attendance_admin_all"    on public.attendance;

create policy "attendance_student_own"
  on public.attendance for select to authenticated using (student_id = auth.uid());

create policy "attendance_teacher_all"
  on public.attendance for all to authenticated
  using (exists (select 1 from public.batches b where b.id = batch_id and b.teacher_id = auth.uid()))
  with check (exists (select 1 from public.batches b where b.id = batch_id and b.teacher_id = auth.uid()));

create policy "attendance_admin_all"
  on public.attendance for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'))
  with check ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));
