-- =============================================================================
-- Rabee Academia — Complete Platform Schema
-- Run once in Supabase SQL Editor. Safe to re-run.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('super_admin','admin','teacher','student');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'class_type') then
    create type public.class_type as enum ('regular','weekend');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending','paid','overdue','refunded');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('assanpay','iban');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'enrollment_status') then
    create type public.enrollment_status as enum ('pending','approved','rejected','cancelled');
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type public.attendance_status as enum ('present','absent','late');
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  phone      text,
  role       public.user_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  name          text not null,
  level         text not null,
  regular_price integer not null,
  weekend_price integer not null,
  lessons       integer not null default 0,
  description   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.batches (
  id            uuid primary key default uuid_generate_v4(),
  subject_id    uuid not null references public.subjects(id),
  teacher_id    uuid not null references public.profiles(id),
  class_type    public.class_type not null,
  meet_link     text,
  schedule_text text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.enrollments (
  id              uuid primary key default uuid_generate_v4(),
  student_id      uuid not null references public.profiles(id),
  subject_id      uuid not null references public.subjects(id),
  batch_id        uuid references public.batches(id),
  class_type      public.class_type not null,
  status          public.enrollment_status not null default 'pending',
  student_name    text,
  student_email   text,
  student_phone   text,
  education_level text,
  payment_method  public.payment_method,
  receipt_url     text,
  assanpay_ref    text,
  approved_by     uuid references public.profiles(id),
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(student_id, subject_id)
);

create table if not exists public.payments (
  id             uuid primary key default uuid_generate_v4(),
  enrollment_id  uuid not null references public.enrollments(id) on delete cascade,
  student_id     uuid not null references public.profiles(id),
  amount_pkr     integer not null,
  month_year     text not null,
  status         public.payment_status not null default 'pending',
  payment_method public.payment_method,
  receipt_url    text,
  assanpay_ref   text,
  verified_by    uuid references public.profiles(id),
  verified_at    timestamptz,
  due_date       date,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

create table if not exists public.attendance (
  id           uuid primary key default uuid_generate_v4(),
  batch_id     uuid not null references public.batches(id),
  student_id   uuid not null references public.profiles(id),
  session_date date not null,
  status       public.attendance_status not null default 'absent',
  marked_by    uuid references public.profiles(id),
  notes        text,
  created_at   timestamptz not null default now(),
  unique(batch_id, student_id, session_date)
);

create table if not exists public.materials (
  id          uuid primary key default uuid_generate_v4(),
  batch_id    uuid not null references public.batches(id),
  teacher_id  uuid not null references public.profiles(id),
  title       text not null,
  description text,
  file_url    text not null,
  file_type   text,
  created_at  timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 3. Functions
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email, phone, role)
  values(
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student')
  ) on conflict(id) do nothing;
  return new;
end;
$$;

-- Promote a user's role. Run in SQL Editor:
-- select public.set_user_role('admin@rabee.test', 'super_admin');
create or replace function public.set_user_role(target_email text, new_role public.user_role)
returns void language plpgsql security definer set search_path = public as $$
declare target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  if target_id is null then raise exception 'No user: %', target_email; end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;


-- ---------------------------------------------------------------------------
-- 4. Triggers
-- ---------------------------------------------------------------------------
drop trigger if exists profiles_updated_at   on public.profiles;
drop trigger if exists enrollments_updated_at on public.enrollments;
drop trigger if exists on_auth_user_created   on auth.users;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 5. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.subjects      enable row level security;
alter table public.batches       enable row level security;
alter table public.enrollments   enable row level security;
alter table public.payments      enable row level security;
alter table public.attendance    enable row level security;
alter table public.materials     enable row level security;
alter table public.notifications enable row level security;


-- ---------------------------------------------------------------------------
-- 6. RLS Policies  (inline subqueries — no helper function dependency)
-- ---------------------------------------------------------------------------

-- profiles
drop policy if exists "profiles_select_own"        on public.profiles;
drop policy if exists "profiles_select_staff"       on public.profiles;
drop policy if exists "profiles_update_own"         on public.profiles;
drop policy if exists "profiles_update_super_admin" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);

create policy "profiles_select_staff"
  on public.profiles for select
  using ((select role from public.profiles where id = auth.uid()) in ('admin','super_admin'));

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_update_super_admin"
  on public.profiles for update
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- subjects
drop policy if exists "subjects_public_read"     on public.subjects;
drop policy if exists "subjects_super_admin_all" on public.subjects;

create policy "subjects_public_read"
  on public.subjects for select using (is_active = true);

create policy "subjects_super_admin_all"
  on public.subjects for all
  using ((select role from public.profiles where id = auth.uid()) = 'super_admin');

-- batches
drop policy if exists "batches_staff_read"   on public.batches;
drop policy if exists "batches_admin_write"  on public.batches;
drop policy if exists "batches_student_read" on public.batches;

create policy "batches_staff_read"
  on public.batches for select
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin','teacher'));

create policy "batches_admin_write"
  on public.batches for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

create policy "batches_student_read"
  on public.batches for select
  using (exists(
    select 1 from public.enrollments e
    where e.batch_id = id and e.student_id = auth.uid() and e.status = 'approved'
  ));

-- enrollments
drop policy if exists "enrollments_student_own"  on public.enrollments;
drop policy if exists "enrollments_staff_all"     on public.enrollments;
drop policy if exists "enrollments_teacher_read"  on public.enrollments;

create policy "enrollments_student_own"
  on public.enrollments for all using (student_id = auth.uid());

create policy "enrollments_staff_all"
  on public.enrollments for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

create policy "enrollments_teacher_read"
  on public.enrollments for select
  using (exists(
    select 1 from public.batches b where b.id = batch_id and b.teacher_id = auth.uid()
  ));

-- payments
drop policy if exists "payments_student_own" on public.payments;
drop policy if exists "payments_staff_all"   on public.payments;

create policy "payments_student_own"
  on public.payments for select using (student_id = auth.uid());

create policy "payments_staff_all"
  on public.payments for all
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

-- attendance
drop policy if exists "attendance_student_own" on public.attendance;
drop policy if exists "attendance_teacher_all" on public.attendance;
drop policy if exists "attendance_admin_read"  on public.attendance;

create policy "attendance_student_own"
  on public.attendance for select using (student_id = auth.uid());

create policy "attendance_teacher_all"
  on public.attendance for all
  using (exists(
    select 1 from public.batches b where b.id = batch_id and b.teacher_id = auth.uid()
  ));

create policy "attendance_admin_read"
  on public.attendance for select
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

-- materials
drop policy if exists "materials_student_read" on public.materials;
drop policy if exists "materials_teacher_all"  on public.materials;
drop policy if exists "materials_admin_read"   on public.materials;

create policy "materials_student_read"
  on public.materials for select
  using (exists(
    select 1 from public.enrollments e
    where e.batch_id = materials.batch_id and e.student_id = auth.uid() and e.status = 'approved'
  ));

create policy "materials_teacher_all"
  on public.materials for all using (teacher_id = auth.uid());

create policy "materials_admin_read"
  on public.materials for select
  using ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));

-- notifications
drop policy if exists "notifications_own"          on public.notifications;
drop policy if exists "notifications_staff_insert" on public.notifications;

create policy "notifications_own"
  on public.notifications for all using (user_id = auth.uid());

create policy "notifications_staff_insert"
  on public.notifications for insert
  with check ((select role from public.profiles where id = auth.uid()) in ('super_admin','admin'));


-- ---------------------------------------------------------------------------
-- 7. Seed subjects
-- ---------------------------------------------------------------------------
insert into public.subjects(slug,name,level,regular_price,weekend_price,lessons,description) values
  ('fsc-physics',      'FSc Physics',         'FSc Level',  7000,  5500, 48,'Complete FSc Physics curriculum with concept-building and exam preparation.'),
  ('fsc-chemistry',    'FSc Chemistry',       'FSc Level',  7000,  5500, 44,'In-depth FSc Chemistry covering organic, inorganic, and physical chemistry.'),
  ('fsc-biology',      'FSc Biology',         'FSc Level',  7000,  5500, 45,'FSc Biology with diagrams, practicals, and MCQ preparation.'),
  ('fsc-math',         'FSc Mathematics',     'FSc Level',  7000,  5500, 50,'FSc Mathematics with step-by-step problem solving and practice.'),
  ('a-level-physics',  'A Level Physics',     'A Level',   15000, 12000, 58,'Cambridge A Level Physics with deep conceptual and practical understanding.'),
  ('a-level-chemistry','A Level Chemistry',   'A Level',   15000, 12000, 60,'A Level Chemistry with focus on CIE exam structure and paper patterns.'),
  ('a-level-math',     'A Level Mathematics', 'A Level',   15000, 12000, 62,'A Level Mathematics covering Pure, Mechanics, and Statistics.'),
  ('o-level-math',     'O Level Mathematics', 'O Level',   15000, 12000, 52,'O Level Mathematics with full IGCSE coverage and exam readiness.'),
  ('o-level-physics',  'O Level Physics',     'O Level',   15000, 12000, 50,'O Level Physics with experiments, theory, and structured revision.'),
  ('bs-cs',            'BS Computer Science', 'BS Level',  10000,  8000, 70,'BS CS covering data structures, algorithms, databases, and software engineering.'),
  ('bs-physics',       'BS Physics',          'BS Level',  10000,  8000, 65,'BS Physics with mathematical foundations, quantum, and classical mechanics.'),
  ('bs-math',          'BS Mathematics',      'BS Level',  10000,  8000, 65,'BS Mathematics with real analysis, algebra, and applied mathematics.'),
  ('ms-cs',            'MS Computer Science', 'MS Level',  18000, 15000, 80,'MS CS with AI, ML, distributed systems, and thesis support.'),
  ('ms-physics',       'MS Physics',          'MS Level',  18000, 15000, 75,'MS Physics covering advanced quantum mechanics, condensed matter, and research methods.'),
  ('ms-math',          'MS Mathematics',      'MS Level',  18000, 15000, 75,'MS Mathematics with topology, functional analysis, and research guidance.')
on conflict(slug) do nothing;


-- ---------------------------------------------------------------------------
-- 8. Test users  (password: TestPass123!)
-- Deletes any previous broken test users and recreates them cleanly.
-- gen_salt('bf', 10) = bcrypt cost 10, which GoTrue requires.
-- ---------------------------------------------------------------------------
do $$
declare
  uid1 uuid := 'a0000001-0000-0000-0000-000000000001';
  uid2 uuid := 'a0000002-0000-0000-0000-000000000002';
  uid3 uuid := 'a0000003-0000-0000-0000-000000000003';
  uid4 uuid := 'a0000004-0000-0000-0000-000000000004';
  uid5 uuid := 'a0000005-0000-0000-0000-000000000005';
begin
  -- Remove old test rows so we can insert fresh
  delete from auth.users
  where email in (
    'superadmin@rabee.test','admin@rabee.test','teacher@rabee.test',
    'student1@rabee.test','student2@rabee.test'
  );

  insert into auth.users (
    instance_id, id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token,
    email_change, email_change_token_new,
    email_change_token_current, reauthentication_token,
    created_at, updated_at, is_sso_user
  ) values
  (
    '00000000-0000-0000-0000-000000000000', uid1,
    'authenticated', 'authenticated',
    'superadmin@rabee.test',
    crypt('TestPass123!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rabee Super Admin","role":"super_admin"}',
    '', '', '', '', '', '', now(), now(), false
  ),
  (
    '00000000-0000-0000-0000-000000000000', uid2,
    'authenticated', 'authenticated',
    'admin@rabee.test',
    crypt('TestPass123!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rabee Admin","role":"admin"}',
    '', '', '', '', '', '', now(), now(), false
  ),
  (
    '00000000-0000-0000-0000-000000000000', uid3,
    'authenticated', 'authenticated',
    'teacher@rabee.test',
    crypt('TestPass123!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Sarah Teacher","role":"teacher"}',
    '', '', '', '', '', '', now(), now(), false
  ),
  (
    '00000000-0000-0000-0000-000000000000', uid4,
    'authenticated', 'authenticated',
    'student1@rabee.test',
    crypt('TestPass123!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ahmed Student","role":"student"}',
    '', '', '', '', '', '', now(), now(), false
  ),
  (
    '00000000-0000-0000-0000-000000000000', uid5,
    'authenticated', 'authenticated',
    'student2@rabee.test',
    crypt('TestPass123!', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ayesha Student","role":"student"}',
    '', '', '', '', '', '', now(), now(), false
  );

  -- Upsert profiles with correct roles
  insert into public.profiles(id, email, full_name, role) values
    (uid1, 'superadmin@rabee.test', 'Rabee Super Admin', 'super_admin'),
    (uid2, 'admin@rabee.test',      'Rabee Admin',       'admin'),
    (uid3, 'teacher@rabee.test',    'Dr. Sarah Teacher', 'teacher'),
    (uid4, 'student1@rabee.test',   'Ahmed Student',     'student'),
    (uid5, 'student2@rabee.test',   'Ayesha Student',    'student')
  on conflict(id) do update
    set role      = excluded.role,
        full_name = excluded.full_name,
        email     = excluded.email;

end $$;
