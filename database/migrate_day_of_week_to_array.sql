-- Migration: Change schedules.day_of_week to TEXT[] (array of day names)
-- Run this if you have schedules table with SMALLINT (0-6) or VARCHAR (single day).
-- Accepts: monday, tuesday, wednesday, thursday, friday, saturday, sunday

ALTER TABLE schedules
  DROP CONSTRAINT IF EXISTS schedules_day_of_week_check;

-- Convert to TEXT[] based on current column type
-- For SMALLINT (0-6): 0=sunday, 1=monday, 2=tuesday, 3=wednesday, 4=thursday, 5=friday, 6=saturday
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'day_of_week';

  IF col_type = 'smallint' THEN
    EXECUTE 'ALTER TABLE schedules ALTER COLUMN day_of_week TYPE TEXT[] USING (
      ARRAY[CASE day_of_week::int
        WHEN 0 THEN ''sunday'' WHEN 1 THEN ''monday'' WHEN 2 THEN ''tuesday''
        WHEN 3 THEN ''wednesday'' WHEN 4 THEN ''thursday'' WHEN 5 THEN ''friday''
        WHEN 6 THEN ''saturday'' ELSE ''monday''
      END]
    )';
  ELSIF col_type = 'character varying' OR col_type = 'varchar' THEN
    EXECUTE 'ALTER TABLE schedules ALTER COLUMN day_of_week TYPE TEXT[] USING (
      ARRAY[lower(trim(day_of_week))]
    )';
  END IF;
END $$;

ALTER TABLE schedules
  ADD CONSTRAINT schedules_day_of_week_check CHECK (
    array_length(day_of_week, 1) > 0 AND
    day_of_week <@ ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday']::text[]
  );
