-- ===========================================================================
-- Rabee Academia — Phase 7: remove super_admin, merge powers into admin
-- Idempotent. Converts existing super_admin accounts to admin and grants admin
-- the privileges that were previously super_admin-only.
-- ===========================================================================

-- 1. Convert existing super admins to admins.
update public.profiles set role = 'admin' where role = 'super_admin';

-- 2. Recursion-safe staff check (SECURITY DEFINER bypasses RLS on profiles).
create or replace function public.is_admin_or_super()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- 3. Subjects — admin can fully manage (was super_admin-only).
drop policy if exists "subjects_super_admin_all" on public.subjects;
drop policy if exists "subjects_admin_all"        on public.subjects;
create policy "subjects_admin_all" on public.subjects
  for all to authenticated
  using (public.is_admin_or_super())
  with check (public.is_admin_or_super());

-- 4. Profiles — admin can update any profile / manage roles (was super_admin-only).
drop policy if exists "profiles_update_super_admin" on public.profiles;
drop policy if exists "profiles_update_admin"        on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin_or_super())
  with check (public.is_admin_or_super());
