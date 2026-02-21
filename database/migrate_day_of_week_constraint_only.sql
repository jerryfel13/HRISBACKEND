-- Run this ONLY if day_of_week is already TEXT[] (you got "cannot cast type text[] to smallint" before).
-- Just adds/updates the constraint; no type change.

ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_day_of_week_check;

ALTER TABLE schedules
  ADD CONSTRAINT schedules_day_of_week_check CHECK (
    array_length(day_of_week, 1) > 0
    AND day_of_week <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  );
