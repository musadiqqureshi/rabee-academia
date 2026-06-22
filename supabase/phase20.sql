-- ===========================================================================
-- Rabee Academia — Phase 20: Batch scheduling columns
-- The Create Batch form sends start_date / end_date / max_students, but the
-- batches table never had these columns, so every batch insert failed. Add
-- them. Idempotent.
-- ===========================================================================

alter table public.batches add column if not exists start_date   date;
alter table public.batches add column if not exists end_date     date;
alter table public.batches add column if not exists max_students integer;
