-- ===========================================================================
-- Rabee Academia — Phase 21: Reliable notification emails + admin broadcast log
--
-- Two fixes:
--  1. Emails weren't arriving. We now send emails INLINE from the app (not only
--     via the optional Supabase webhook). To avoid double-sending, every
--     notification row carries an `emailed` flag: app code sets it to true when
--     it has already emailed the user, and the webhook skips those rows. Rows
--     created by DB triggers (e.g. new messages) default to emailed=false, so
--     the webhook still emails those.
--  2. The admin "Sent Notifications" history was empty because the page read a
--     non-existent `recipient_role` column and RLS hid other users' rows. We add
--     a dedicated `notification_broadcasts` log table that admins can read.
-- Idempotent.
-- ===========================================================================

-- 1. Track whether a notification has already been emailed by the app.
alter table public.notifications add column if not exists emailed boolean not null default false;

-- 2. Broadcast log: one row per admin announcement (not per recipient).
create table if not exists public.notification_broadcasts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  body            text,
  recipient_role  text not null default 'student',
  recipient_count integer not null default 0,
  sent_by         uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.notification_broadcasts enable row level security;

-- Admins & super-admins can read and insert broadcast logs.
drop policy if exists "broadcasts_admin_read" on public.notification_broadcasts;
create policy "broadcasts_admin_read" on public.notification_broadcasts
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "broadcasts_admin_insert" on public.notification_broadcasts;
create policy "broadcasts_admin_insert" on public.notification_broadcasts
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'super_admin')
    )
  );

create index if not exists notification_broadcasts_created_idx
  on public.notification_broadcasts (created_at desc);
