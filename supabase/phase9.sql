-- ===========================================================================
-- Rabee Academia — Phase 9: attendance-on-login
-- Lets a student record their own 'present' mark for a batch they're enrolled
-- in (used to auto-mark attendance when they log in). Teacher/admin policies
-- from phase4 still apply (policies are OR'd). Idempotent.
-- ===========================================================================

drop policy if exists "attendance_self_insert" on public.attendance;
create policy "attendance_self_insert" on public.attendance
  for insert to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.batch_id = attendance.batch_id
        and e.student_id = auth.uid()
        and e.status = 'approved'
    )
  );
