-- =============================================================================
-- Assignment file (image) uploads. Run in the Supabase SQL editor (idempotent).
-- Students upload one image straight from the browser to Storage (bypasses the
-- server-action / serverless body-size limit); teachers view it via signed URL.
-- =============================================================================

alter table public.assignment_submissions add column if not exists file_url text;

-- Private bucket (teachers/admins read via signed URLs generated with the
-- service role on the teacher page).
insert into storage.buckets (id, name, public)
values ('assignment-files', 'assignment-files', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage RLS: a student may upload / replace / read files ONLY inside their
-- own top-level folder (named after their user id): "<uid>/<assignmentId>.ext".
-- ---------------------------------------------------------------------------
drop policy if exists "assign_files_insert_own" on storage.objects;
drop policy if exists "assign_files_update_own" on storage.objects;
drop policy if exists "assign_files_select_own" on storage.objects;
drop policy if exists "assign_files_delete_own" on storage.objects;

create policy "assign_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assignment-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "assign_files_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'assignment-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'assignment-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "assign_files_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'assignment-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "assign_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'assignment-files' and (storage.foldername(name))[1] = auth.uid()::text);
