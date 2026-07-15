-- =============================================================================
-- AI Mastery — open Batch 2 as a paid, one-time course (PKR 499).
-- The enrolment flow and invoices read the PRICE from the subjects row (never
-- from client input), so Batch 2 will only charge 499 once this is applied.
-- Run in the Supabase SQL editor (idempotent).
-- =============================================================================

update public.subjects
set regular_price = 499,
    weekend_price = 499,
    description = 'Batch 2 is now open! A hands-on 1-month weekend bootcamp on practical AI — automation workflows, AI reel creation and AI cartoon/animation generation. One-time fee of just PKR 499.',
    is_active = true
where slug = 'ai-mastery';

-- If the subject was never seeded, create it (paid, one-time).
insert into public.subjects(slug, name, level, regular_price, weekend_price, lessons, description, is_active)
select 'ai-mastery', 'Introductory AI Mastery Course', 'Special', 499, 499, 24,
       'Batch 2 is now open! A hands-on 1-month weekend bootcamp on practical AI — automation workflows, AI reel creation and AI cartoon/animation generation. One-time fee of just PKR 499.',
       true
where not exists (select 1 from public.subjects where slug = 'ai-mastery');

-- ---------------------------------------------------------------------------
-- Mark AI Mastery BATCH 1 complete and release certificates. Every currently
-- approved AI Mastery student (i.e. Batch 1 — Batch 2 hasn't enrolled yet) is
-- flagged completed, which makes their certificate available on the portal.
-- Run this BEFORE any Batch 2 enrolments are approved.
-- ---------------------------------------------------------------------------
update public.enrollments e
set completed = true,
    completed_at = coalesce(e.completed_at, now())
from public.subjects s
where e.subject_id = s.id
  and s.slug = 'ai-mastery'
  and e.status = 'approved'
  and e.completed = false;

-- Notify each of those students that their certificate is ready.
insert into public.notifications (user_id, title, body)
select e.student_id, 'Course completed 🎓',
       'Congratulations! You have completed the AI Mastery Course (Batch 1). Your certificate is now available in the Certificates section of your dashboard.'
from public.enrollments e
join public.subjects s on s.id = e.subject_id
where s.slug = 'ai-mastery' and e.status = 'approved' and e.completed = true;
