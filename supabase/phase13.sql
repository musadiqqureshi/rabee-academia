-- ===========================================================================
-- Rabee Academia — Phase 13: Add Computer Science subjects
-- FSc Computer Science and A/O Level Computer Science. The public catalogue
-- reads the subjects table, so these rows make the courses appear on the
-- landing/pricing pages and manageable from the admin Subjects page. Idempotent.
-- ===========================================================================

insert into public.subjects(slug, name, level, regular_price, weekend_price, lessons, description, is_active) values
  ('fsc-cs',      'FSc Computer Science',       'FSc Level',  7000,  5500, 46, 'FSc Computer Science covering programming fundamentals, databases and core computing concepts.', true),
  ('ao-level-cs', 'A/O Level Computer Science', 'A/O Level', 15000, 12000, 58, 'Cambridge A/O Level Computer Science with theory, programming and full exam preparation.', true)
on conflict(slug) do nothing;
