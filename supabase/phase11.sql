-- ===========================================================================
-- Rabee Academia — Phase 11: per-student 1:1 class links
-- The academy runs ONE-ON-ONE sessions, so each enrolment gets its own meet
-- link (group batch link is kept only for the AI Mastery course). Idempotent.
-- ===========================================================================

alter table public.enrollments add column if not exists meet_link text;

-- Teachers can update enrolments allotted to them (to set the 1:1 meet link).
drop policy if exists "enrollments_teacher_update" on public.enrollments;
create policy "enrollments_teacher_update" on public.enrollments
  for update to authenticated
  using (
    teacher_id = auth.uid()
    or exists (select 1 from public.batches b where b.id = batch_id and b.teacher_id = auth.uid())
  )
  with check (
    teacher_id = auth.uid()
    or exists (select 1 from public.batches b where b.id = batch_id and b.teacher_id = auth.uid())
  );
