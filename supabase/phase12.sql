-- ===========================================================================
-- Rabee Academia — Phase 12: Seed the AI Mastery special course as a subject
-- The AI Mastery course is free (price 0) and seat-limited. Enrolment resolves
-- the matching subject row by slug; if it was never seeded, students cannot
-- create it (RLS: only admins may insert subjects) and enrolment fails with
-- "Could not resolve the selected course". This back-fills that row. Idempotent.
-- ===========================================================================

insert into public.subjects(slug, name, level, regular_price, weekend_price, lessons, description, is_active) values
  (
    'ai-mastery',
    'AI Mastery Course',
    'Special',
    0,
    0,
    24,
    'A 2-week intensive on practical AI — tools, prompt engineering and automation for studies and work. Free launching offer, weekends only, limited to 30 seats. Starts July 2026.',
    true
  )
on conflict(slug) do nothing;
