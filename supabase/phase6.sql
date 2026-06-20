-- ===========================================================================
-- Rabee Academia — Phase 6: live notification bell
-- Adds the notifications table to the Realtime publication so the in-portal
-- bell updates instantly. Idempotent.
-- ===========================================================================

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; when others then null; end $$;

-- Ensure the owner can read + update (mark read) their own notifications.
alter table public.notifications enable row level security;
drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own"
  on public.notifications for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
