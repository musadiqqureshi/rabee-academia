-- =============================================================================
-- Seed the Quran Learning subjects into the catalog so admins can create
-- batches, assign teachers, and allot enrolled students — exactly like every
-- other subject. Run in the Supabase SQL editor. Idempotent (re-runnable):
-- updates name/level/price/lessons on conflict, never duplicates.
-- Prices match src/lib/courses.ts (PKR 11,000; the 5,000 launch offer is applied
-- in code via launchPrice, not stored here).
-- =============================================================================

insert into public.subjects (slug, name, level, lessons, regular_price, weekend_price, description, is_active)
values
  ('quran-noorani-qaida', 'Noorani Qaida',                    'Quran', 24, 11000, 11000, 'Build a strong foundation for Quran reading from the very first letter, with correct makharij.', true),
  ('quran-nazra',         'Nazra Quran',                      'Quran', 36, 11000, 11000, 'Learn fluent, confident Quran recitation with proper flow and rhythm.', true),
  ('quran-tajweed',       'Tajweed',                          'Quran', 30, 11000, 11000, 'Master correct pronunciation and the rules of articulation for beautiful recitation.', true),
  ('quran-hifz',          'Hifz Support',                     'Quran', 48, 11000, 11000, 'Structured memorization with smart, spaced revision plans and consistent tracking.', true),
  ('quran-islamic-studies','Islamic Studies',                 'Quran', 24, 11000, 11000, 'Daily Duas, Salah, Islamic manners and basic Aqeedah — age-appropriate and practical.', true),
  ('quran-translation',   'Quran Translation & Understanding','Quran', 30, 11000, 11000, 'Understand selected Surahs and their meanings through age-appropriate lessons.', true)
on conflict (slug) do update set
  name          = excluded.name,
  level         = excluded.level,
  lessons       = excluded.lessons,
  regular_price = excluded.regular_price,
  weekend_price = excluded.weekend_price,
  description   = excluded.description,
  is_active     = true;
