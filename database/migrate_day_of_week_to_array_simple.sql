-- Migration: Change schedules.day_of_week to TEXT[] (array of day names)
-- Run each statement in order against your hris database.
-- Use: Execute SQL Script (entire file) or run each block separately.
--
-- If you got "cannot cast type text[] to integer": column is already TEXT[] -> skip step 2, run only 1 and 3.
-- If day_of_week is SMALLINT (0-6): run step 2a.
-- If day_of_week is VARCHAR: run step 2b instead.

-- 1. Drop existing constraint (if any)
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_day_of_week_check;

-- 2. Convert to TEXT[] only if column is SMALLINT or VARCHAR (skips if already TEXT[])
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'day_of_week';

  IF col_type = 'smallint' THEN
    ALTER TABLE schedules
      ALTER COLUMN day_of_week TYPE TEXT[] USING (
        ARRAY[CASE day_of_week::smallint
          WHEN 0 THEN 'sunday' WHEN 1 THEN 'monday' WHEN 2 THEN 'tuesday'
          WHEN 3 THEN 'wednesday' WHEN 4 THEN 'thursday' WHEN 5 THEN 'friday'
          WHEN 6 THEN 'saturday' ELSE 'monday'
        END]
      );
  ELSIF col_type IN ('character varying', 'varchar') THEN
    ALTER TABLE schedules
      ALTER COLUMN day_of_week TYPE TEXT[] USING (ARRAY[lower(trim(day_of_week))]);
  END IF;
  -- If already TEXT[], do nothing
END $$;

-- 3. Add new constraint (always run this)
ALTER TABLE schedules
  ADD CONSTRAINT schedules_day_of_week_check CHECK (
    array_length(day_of_week, 1) > 0
    AND day_of_week <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  );
