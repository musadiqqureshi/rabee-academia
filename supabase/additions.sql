-- =============================================================================
-- Rabee Academia — Additions: Storage, RLS Policies
-- Run in Supabase SQL Editor after schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

-- Storage policies: receipts
create policy "Students upload own receipts"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone read receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts');

-- Storage policies: materials
create policy "Teachers upload materials"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'materials'
    AND exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('teacher', 'admin', 'super_admin')
    )
  );

create policy "Authenticated read materials"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'materials');

-- ---------------------------------------------------------------------------
-- RLS for enrollments (enable + policies)
-- ---------------------------------------------------------------------------
alter table public.enrollments enable row level security;

-- Students can view and create their own enrollments
create policy "Students view own enrollments"
  on public.enrollments for select
  to authenticated
  using (student_id = auth.uid());

create policy "Students create own enrollments"
  on public.enrollments for insert
  to authenticated
  with check (student_id = auth.uid());

-- Admins and super_admins can view/update all enrollments
create policy "Admins manage enrollments"
  on public.enrollments for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- ---------------------------------------------------------------------------
-- RLS for other tables (if not already enabled)
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.materials enable row level security;
alter table public.notifications enable row level security;

-- Profiles: everyone can read, own profile is writable
create policy "Public read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Own profile update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- Subjects: public read
create policy "Public read subjects"
  on public.subjects for select
  to authenticated
  using (true);

-- Admins can manage subjects
create policy "Admins manage subjects"
  on public.subjects for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Materials: authenticated read (for enrolled students and teachers)
create policy "Authenticated read materials"
  on public.materials for select
  to authenticated
  using (true);

create policy "Teachers insert materials"
  on public.materials for insert
  to authenticated
  with check (teacher_id = auth.uid());

-- Notifications: own only
create policy "Own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins send notifications"
  on public.notifications for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Notification read update
create policy "Own notifications update"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid());
