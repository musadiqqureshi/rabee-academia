-- =============================================================================
-- Profile avatars. Run in the Supabase SQL editor (idempotent).
-- Adds profiles.avatar_url and a public 'avatars' storage bucket. Uploads are
-- performed server-side with the service role, so no public write policy is
-- needed — only public read so the image URL works.
-- =============================================================================

alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
