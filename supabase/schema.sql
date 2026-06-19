-- =============================================================================
-- Rabee Academia — Stage 1 schema (authentication & profiles)
-- Run this in the Supabase SQL Editor on a fresh project.
-- Later stages add enrollments, payments, batches, LMS tables, etc.
-- =============================================================================

-- Role enum used across the platform.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'super_admin',
      'admin',
      'teacher',
      'student'
    );
  end if;
end $$;

-- Profile row per auth user. Mirrors auth.users and stores the app role.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  role        public.user_role not null default 'student',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: read the current user's role without tripping RLS recursion.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- RLS policies
-- -----------------------------------------------------------------------------

-- Users can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins and super admins can read every profile.
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff"
  on public.profiles for select
  using (public.current_user_role() in ('admin', 'super_admin'));

-- Users can update their own profile, but NOT their role.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.current_user_role());

-- Super admins can update any profile (including roles).
drop policy if exists "profiles_update_super_admin" on public.profiles;
create policy "profiles_update_super_admin"
  on public.profiles for update
  using (public.current_user_role() = 'super_admin');

-- -----------------------------------------------------------------------------
-- Auto-create a profile when a new auth user signs up.
-- Public sign-ups always land as 'student'; staff roles are promoted later by
-- a super admin (or seeded manually).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'student'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Promote a user to a staff role (run manually as the project owner).
-- Example:
--   select public.set_user_role('admin@rabeeacademia.com', 'super_admin');
-- -----------------------------------------------------------------------------
create or replace function public.set_user_role(
  target_email text,
  new_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where email = target_email;
  if target_id is null then
    raise exception 'No user found with email %', target_email;
  end if;

  update public.profiles set role = new_role where id = target_id;
end;
$$;
