-- Migration: Convert schedules.day_of_week to TEXT[] (array of day names)
-- Run this entire script against the SAME database your backend connects to.
-- First run: node scripts/check-schedules-column.js  (to verify which DB/type)

-- 1. Drop constraint if exists
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_day_of_week_check;

-- 2. Convert column (only if SMALLINT - skip if already TEXT[])
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'day_of_week';

  IF col_type = 'smallint' THEN
    -- Add temp column, copy SMALLINT->TEXT[], drop old, rename
    ALTER TABLE schedules ADD COLUMN IF NOT EXISTS day_of_week_new TEXT[];
    UPDATE schedules SET day_of_week_new = ARRAY[CASE day_of_week::smallint
      WHEN 0 THEN 'sunday' WHEN 1 THEN 'monday' WHEN 2 THEN 'tuesday'
      WHEN 3 THEN 'wednesday' WHEN 4 THEN 'thursday' WHEN 5 THEN 'friday'
      WHEN 6 THEN 'saturday' ELSE 'monday' END];
    ALTER TABLE schedules DROP COLUMN day_of_week;
    ALTER TABLE schedules RENAME COLUMN day_of_week_new TO day_of_week;
  ELSIF col_type IN ('character varying','varchar') THEN
    ALTER TABLE schedules ADD COLUMN IF NOT EXISTS day_of_week_new TEXT[];
    UPDATE schedules SET day_of_week_new = ARRAY[lower(trim(day_of_week))];
    ALTER TABLE schedules DROP COLUMN day_of_week;
    ALTER TABLE schedules RENAME COLUMN day_of_week_new TO day_of_week;
  END IF;
  -- If already ARRAY/text[], do nothing
END $$;

-- 3. Add constraint
ALTER TABLE schedules
  ADD CONSTRAINT schedules_day_of_week_check CHECK (
    array_length(day_of_week, 1) > 0
    AND day_of_week <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  );
