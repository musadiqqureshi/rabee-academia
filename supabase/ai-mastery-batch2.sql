-- =============================================================================
-- AI Mastery — open Batch 2 as a paid, one-time course (PKR 499).
-- The enrolment flow and invoices read the PRICE from the subjects row (never
-- from client input), so Batch 2 will only charge 499 once this is applied.
-- Run in the Supabase SQL editor (idempotent).
-- =============================================================================

update public.subjects
set regular_price = 499,
    weekend_price = 499,
    description = 'Batch 2 is now open! A hands-on weekend bootcamp on practical AI — automation workflows, AI reel creation and AI cartoon/animation generation. One-time fee of just PKR 499.',
    is_active = true
where slug = 'ai-mastery';

-- If the subject was never seeded, create it (paid, one-time).
insert into public.subjects(slug, name, level, regular_price, weekend_price, lessons, description, is_active)
select 'ai-mastery', 'Introductory AI Mastery Course', 'Special', 499, 499, 24,
       'Batch 2 is now open! A hands-on weekend bootcamp on practical AI — automation workflows, AI reel creation and AI cartoon/animation generation. One-time fee of just PKR 499.',
       true
where not exists (select 1 from public.subjects where slug = 'ai-mastery');
