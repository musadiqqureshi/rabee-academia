-- ===========================================================================
-- Rabee Academia — Phase 8: teacher↔subject assignment + auto-allotment
-- Lets enrollment work WITHOUT manually creating a batch: when a teacher is
-- assigned to the subject, approving an enrolment auto-allots the student to
-- that teacher (auto-creating a batch behind the scenes). Idempotent.
-- ===========================================================================

create extension if not exists "uuid-ossp";

-- Teacher is assigned to teach a subject.
create table if not exists public.teacher_subjects (
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, subject_id)
);

-- Direct teacher link on enrolment (in addition to batch).
alter table public.enrollments add column if not exists teacher_id uuid references public.profiles(id);

alter table public.teacher_subjects enable row level security;

drop policy if exists "teacher_subjects_staff"   on public.teacher_subjects;
drop policy if exists "teacher_subjects_teacher"  on public.teacher_subjects;
drop policy if exists "teacher_subjects_read"     on public.teacher_subjects;

-- Admins manage; teachers read their own; everyone authenticated can read the
-- mapping (needed so the student portal can show "teacher available").
create policy "teacher_subjects_staff" on public.teacher_subjects
  for all to authenticated
  using (public.is_admin_or_super()) with check (public.is_admin_or_super());

create policy "teacher_subjects_read" on public.teacher_subjects
  for select to authenticated using (true);
