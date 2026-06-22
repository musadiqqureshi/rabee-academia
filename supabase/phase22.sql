-- ===========================================================================
-- Rabee Academia — Phase 22: live, public AI Mastery seat count
-- RLS hides enrolments from anon visitors, so the landing seat counter always
-- read 0. These SECURITY DEFINER helpers return accurate counts safely.
-- Idempotent.
-- ===========================================================================

-- Public: how many seats are taken on the AI Mastery course (pending+approved).
create or replace function public.ai_mastery_seats()
returns integer language sql security definer set search_path = public stable as $$
  select count(*)::int
  from public.enrollments e
  join public.subjects s on s.id = e.subject_id
  where s.slug = 'ai-mastery' and e.status in ('pending','approved');
$$;
grant execute on function public.ai_mastery_seats() to anon, authenticated;

-- Accurate enrolment count for any subject (used to enforce seat limits during
-- enrolment regardless of the caller's RLS view).
create or replace function public.subject_enrolled_count(p_subject uuid)
returns integer language sql security definer set search_path = public stable as $$
  select count(*)::int
  from public.enrollments e
  where e.subject_id = p_subject and e.status in ('pending','approved');
$$;
grant execute on function public.subject_enrolled_count(uuid) to anon, authenticated;
