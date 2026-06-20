-- ===========================================================================
-- Rabee Academia — Phase 10: per-batch meet link + schedule text
-- Idempotent. Ensures the columns used by the Class Links editor and the AI
-- schedule generator exist.
-- ===========================================================================

alter table public.batches add column if not exists meet_link     text;
alter table public.batches add column if not exists schedule_text text;
