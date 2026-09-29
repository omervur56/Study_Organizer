-- In der Supabase SQL-Konsole ausführen, um Kursinfos (z.B. aus Moodle-CATEGORIES) zu speichern.
alter table public.study_events add column if not exists course text;
