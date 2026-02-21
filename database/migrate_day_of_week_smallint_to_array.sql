-- Run this ONLY if day_of_week is SMALLINT (integer 0-6).
-- If you get "cannot cast type text[] to smallint", your column is already TEXT[] - run only migrate_day_of_week_simple_step1_and_3.sql

-- Step 1: Drop old constraint
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_day_of_week_check;

-- Step 2: Convert SMALLINT to TEXT[] (0=sunday, 1=monday, 2=tuesday, 3=wednesday, 4=thursday, 5=friday, 6=saturday)
ALTER TABLE schedules
  ALTER COLUMN day_of_week TYPE TEXT[] USING (
    ARRAY[CASE day_of_week
      WHEN 0 THEN 'sunday' WHEN 1 THEN 'monday' WHEN 2 THEN 'tuesday'
      WHEN 3 THEN 'wednesday' WHEN 4 THEN 'thursday' WHEN 5 THEN 'friday'
      WHEN 6 THEN 'saturday' ELSE 'monday'
    END]
  );

-- Step 3: Add new constraint
ALTER TABLE schedules
  ADD CONSTRAINT schedules_day_of_week_check CHECK (
    array_length(day_of_week, 1) > 0
    AND day_of_week <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  );
