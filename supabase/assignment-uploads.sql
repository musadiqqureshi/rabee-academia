-- =============================================================================
-- Assignment file (image) uploads. Run in the Supabase SQL editor (idempotent).
-- Students can attach one image to a submission; teachers view it (signed URL).
-- =============================================================================

alter table public.assignment_submissions add column if not exists file_url text;

-- Private bucket (teachers/admins read via signed URLs).
insert into storage.buckets (id, name, public)
values ('assignment-files', 'assignment-files', false)
on conflict (id) do nothing;
