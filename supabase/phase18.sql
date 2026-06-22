-- ===========================================================================
-- Rabee Academia — Phase 18: Refresh the AI Mastery course description
-- The public pricing page reads the subjects table, so update the stored
-- description to the fuller course copy. Idempotent (safe to re-run).
-- ===========================================================================

update public.subjects
set description = 'Rabee''s AI Mastery is a hands-on, 2-week weekend bootcamp that turns you into a confident, job-ready AI user and builder. You''ll master practical AI tools, prompt engineering, workflow automation and build real AI-powered projects — the exact skills modern software teams hire for. No prior coding experience needed: we start from the basics and take you all the way to shipping your own AI projects. Free launching offer, weekends only, limited to 30 seats. Starts July 2026.'
where slug = 'ai-mastery';
