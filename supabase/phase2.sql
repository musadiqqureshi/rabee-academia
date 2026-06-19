-- ===========================================================================
-- Rabee Academia — Phase 2: Academic Management
-- Assignments, Quizzes, Invoices, Student identifiers.
-- Idempotent: safe to run multiple times. Run AFTER schema.sql.
-- ===========================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.submission_type as enum ('portal','google_drive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.submission_status as enum ('draft','submitted','graded','returned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quiz_question_type as enum ('mcq','true_false','short_answer','long_answer','file_upload');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quiz_attempt_status as enum ('in_progress','submitted','graded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.grading_mode as enum ('manual','ai');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('draft','issued','paid','overdue','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_category as enum ('registration','monthly_fee','special_class','exam_fee');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. Student identifiers (Student ID + Enrollment Number)
-- ---------------------------------------------------------------------------
alter table public.profiles    add column if not exists student_code text;
alter table public.enrollments add column if not exists enrollment_number text;

create sequence if not exists public.student_code_seq start 1001;
create sequence if not exists public.enrollment_number_seq start 1;

-- Assign a human-friendly Student ID (RA-#####) to new student profiles.
create or replace function public.assign_student_code()
returns trigger language plpgsql as $$
begin
  if new.role = 'student' and (new.student_code is null or new.student_code = '') then
    new.student_code := 'RA-' || lpad(nextval('public.student_code_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_student_code on public.profiles;
create trigger profiles_student_code
  before insert on public.profiles
  for each row execute function public.assign_student_code();

-- Assign an Enrollment Number (EN-YYYY-#####) on enrollment creation.
create or replace function public.assign_enrollment_number()
returns trigger language plpgsql as $$
begin
  if new.enrollment_number is null or new.enrollment_number = '' then
    new.enrollment_number := 'EN-' || to_char(now(),'YYYY') || '-'
      || lpad(nextval('public.enrollment_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists enrollments_number on public.enrollments;
create trigger enrollments_number
  before insert on public.enrollments
  for each row execute function public.assign_enrollment_number();

-- Backfill existing rows.
update public.profiles
   set student_code = 'RA-' || lpad(nextval('public.student_code_seq')::text, 5, '0')
 where role = 'student' and (student_code is null or student_code = '');

update public.enrollments
   set enrollment_number = 'EN-' || to_char(coalesce(created_at, now()),'YYYY') || '-'
     || lpad(nextval('public.enrollment_number_seq')::text, 5, '0')
 where enrollment_number is null or enrollment_number = '';

-- ---------------------------------------------------------------------------
-- 3. Assignments
-- ---------------------------------------------------------------------------
create table if not exists public.assignments (
  id              uuid primary key default uuid_generate_v4(),
  batch_id        uuid not null references public.batches(id) on delete cascade,
  teacher_id      uuid not null references public.profiles(id),
  subject_id      uuid references public.subjects(id),
  title           text not null,
  description     text,
  instructions    text,
  due_date        timestamptz,
  total_marks     integer not null default 100,
  submission_type public.submission_type not null default 'portal',
  resource_url    text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Optional per-student targeting; if no rows, the assignment targets the whole batch.
create table if not exists public.assignment_students (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (assignment_id, student_id)
);

create table if not exists public.assignment_submissions (
  id             uuid primary key default uuid_generate_v4(),
  assignment_id  uuid not null references public.assignments(id) on delete cascade,
  student_id     uuid not null references public.profiles(id),
  content        text,                    -- portal rich-text (HTML)
  drive_url      text,                    -- google_drive submissions
  status         public.submission_status not null default 'draft',
  submitted_at   timestamptz,
  marks_obtained integer,
  feedback       text,
  graded_by      uuid references public.profiles(id),
  graded_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists idx_assignments_batch    on public.assignments(batch_id);
create index if not exists idx_assignments_teacher  on public.assignments(teacher_id);
create index if not exists idx_submissions_assignment on public.assignment_submissions(assignment_id);
create index if not exists idx_submissions_student   on public.assignment_submissions(student_id);

-- ---------------------------------------------------------------------------
-- 4. Quizzes
-- ---------------------------------------------------------------------------
create table if not exists public.quizzes (
  id                  uuid primary key default uuid_generate_v4(),
  batch_id            uuid not null references public.batches(id) on delete cascade,
  teacher_id          uuid not null references public.profiles(id),
  subject_id          uuid references public.subjects(id),
  title               text not null,
  description         text,
  time_limit_minutes  integer,
  attempt_limit       integer not null default 1,
  passing_score       integer not null default 50,
  randomize_questions boolean not null default false,
  randomize_answers   boolean not null default false,
  grading_mode        public.grading_mode not null default 'manual',
  available_from      timestamptz,
  available_until     timestamptz,
  total_marks         integer not null default 0,
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id             uuid primary key default uuid_generate_v4(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  question_type  public.quiz_question_type not null,
  prompt         text not null,
  options        jsonb,            -- [{ "id": "a", "text": "..." }, ...] for mcq
  correct_answer text,             -- mcq option id | 'true'/'false' | model answer
  marks          integer not null default 1,
  position       integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id           uuid primary key default uuid_generate_v4(),
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  student_id   uuid not null references public.profiles(id),
  status       public.quiz_attempt_status not null default 'in_progress',
  answers      jsonb not null default '{}'::jsonb,   -- { question_id: answer }
  score        integer,
  max_score    integer,
  feedback     text,
  ai_graded    boolean not null default false,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  graded_by    uuid references public.profiles(id),
  graded_at    timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_quizzes_batch     on public.quizzes(batch_id);
create index if not exists idx_quiz_questions_quiz on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_attempts_quiz  on public.quiz_attempts(quiz_id);
create index if not exists idx_quiz_attempts_student on public.quiz_attempts(student_id);

-- ---------------------------------------------------------------------------
-- 5. Invoices
-- ---------------------------------------------------------------------------
create sequence if not exists public.invoice_number_seq start 1;

create table if not exists public.invoices (
  id             uuid primary key default uuid_generate_v4(),
  invoice_number text unique not null
                   default ('INV-' || to_char(now(),'YYYY') || '-'
                     || lpad(nextval('public.invoice_number_seq')::text, 5, '0')),
  student_id     uuid not null references public.profiles(id),
  enrollment_id  uuid references public.enrollments(id) on delete set null,
  subject_id     uuid references public.subjects(id),
  category       public.invoice_category not null default 'monthly_fee',
  description    text,
  amount_pkr     integer not null,
  status         public.invoice_status not null default 'issued',
  due_date       date,
  issued_at      timestamptz not null default now(),
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists idx_invoices_student on public.invoices(student_id);

-- ---------------------------------------------------------------------------
-- 6. updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists assignments_updated_at on public.assignments;
create trigger assignments_updated_at before update on public.assignments
  for each row execute function public.set_updated_at();

drop trigger if exists submissions_updated_at on public.assignment_submissions;
create trigger submissions_updated_at before update on public.assignment_submissions
  for each row execute function public.set_updated_at();

drop trigger if exists quizzes_updated_at on public.quizzes;
create trigger quizzes_updated_at before update on public.quizzes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.assignments            enable row level security;
alter table public.assignment_students    enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.quizzes                enable row level security;
alter table public.quiz_questions         enable row level security;
alter table public.quiz_attempts          enable row level security;
alter table public.invoices               enable row level security;

-- ---------------------------------------------------------------------------
-- 8. RLS Policies (inline subqueries, matching schema.sql conventions)
-- ---------------------------------------------------------------------------

-- assignments
drop policy if exists "assignments_teacher_all"   on public.assignments;
drop policy if exists "assignments_staff_all"      on public.assignments;
drop policy if exists "assignments_student_read"   on public.assignments;

create policy "assignments_teacher_all"
  on public.assignments for all using (teacher_id = auth.uid());

create policy "assignments_staff_all"
  on public.assignments for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

create policy "assignments_student_read"
  on public.assignments for select
  using (
    is_published = true and exists(
      select 1 from public.enrollments e
      where e.batch_id = assignments.batch_id
        and e.student_id = auth.uid() and e.status = 'approved'
    )
  );

-- assignment_students
drop policy if exists "assignment_students_staff" on public.assignment_students;
drop policy if exists "assignment_students_own"   on public.assignment_students;

create policy "assignment_students_staff"
  on public.assignment_students for all
  using (exists(
    select 1 from public.assignments a
    where a.id = assignment_id
      and (a.teacher_id = auth.uid()
           or (select role from public.profiles where id = auth.uid()) in ('super_admin','admin'))
  ));

create policy "assignment_students_own"
  on public.assignment_students for select using (student_id = auth.uid());

-- assignment_submissions
drop policy if exists "submissions_student_own" on public.assignment_submissions;
drop policy if exists "submissions_teacher"     on public.assignment_submissions;
drop policy if exists "submissions_admin_read"  on public.assignment_submissions;

create policy "submissions_student_own"
  on public.assignment_submissions for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "submissions_teacher"
  on public.assignment_submissions for all
  using (exists(
    select 1 from public.assignments a
    where a.id = assignment_id and a.teacher_id = auth.uid()
  ));

create policy "submissions_admin_read"
  on public.assignment_submissions for select
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

-- quizzes
drop policy if exists "quizzes_teacher_all"  on public.quizzes;
drop policy if exists "quizzes_staff_all"     on public.quizzes;
drop policy if exists "quizzes_student_read"   on public.quizzes;

create policy "quizzes_teacher_all"
  on public.quizzes for all using (teacher_id = auth.uid());

create policy "quizzes_staff_all"
  on public.quizzes for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

create policy "quizzes_student_read"
  on public.quizzes for select
  using (
    is_published = true and exists(
      select 1 from public.enrollments e
      where e.batch_id = quizzes.batch_id
        and e.student_id = auth.uid() and e.status = 'approved'
    )
  );

-- quiz_questions  (students read questions for published quizzes they're enrolled in)
drop policy if exists "quiz_questions_teacher_all" on public.quiz_questions;
drop policy if exists "quiz_questions_staff_all"   on public.quiz_questions;
drop policy if exists "quiz_questions_student_read" on public.quiz_questions;

create policy "quiz_questions_teacher_all"
  on public.quiz_questions for all
  using (exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid()));

create policy "quiz_questions_staff_all"
  on public.quiz_questions for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

create policy "quiz_questions_student_read"
  on public.quiz_questions for select
  using (exists(
    select 1 from public.quizzes q
    join public.enrollments e on e.batch_id = q.batch_id
    where q.id = quiz_id and q.is_published = true
      and e.student_id = auth.uid() and e.status = 'approved'
  ));

-- quiz_attempts
drop policy if exists "quiz_attempts_student_own" on public.quiz_attempts;
drop policy if exists "quiz_attempts_teacher"     on public.quiz_attempts;
drop policy if exists "quiz_attempts_admin_read"  on public.quiz_attempts;

create policy "quiz_attempts_student_own"
  on public.quiz_attempts for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "quiz_attempts_teacher"
  on public.quiz_attempts for all
  using (exists(select 1 from public.quizzes q where q.id = quiz_id and q.teacher_id = auth.uid()));

create policy "quiz_attempts_admin_read"
  on public.quiz_attempts for select
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

-- invoices
drop policy if exists "invoices_student_own" on public.invoices;
drop policy if exists "invoices_staff_all"   on public.invoices;

create policy "invoices_student_own"
  on public.invoices for select using (student_id = auth.uid());

create policy "invoices_staff_all"
  on public.invoices for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));
