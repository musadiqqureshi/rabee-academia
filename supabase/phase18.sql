-- ===========================================================================
-- Rabee Academia — Phase 18: Keep the AI Mastery card description short
-- The public pricing page reads the subjects table. The full course write-up
-- and internship offer live on the reserve-seat page, so the card keeps a
-- concise blurb. Idempotent (safe to re-run).
-- ===========================================================================

update public.subjects
set description = 'A free 2-week weekend bootcamp on practical AI — tools, prompt engineering and automation. Limited to 30 seats. Starts July 2026.'
where slug = 'ai-mastery';
