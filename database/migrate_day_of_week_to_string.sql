-- Migration: Change schedules.day_of_week from SMALLINT (0-6) to VARCHAR (monday, tuesday, ...)
-- Run this if you already have schedules table with the old integer day_of_week.
-- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday in JavaScript Date.getDay()

ALTER TABLE schedules
  DROP CONSTRAINT IF EXISTS schedules_day_of_week_check;

ALTER TABLE schedules
  ALTER COLUMN day_of_week TYPE VARCHAR(20) USING (
    CASE day_of_week
      WHEN 0 THEN 'sunday'
      WHEN 1 THEN 'monday'
      WHEN 2 THEN 'tuesday'
      WHEN 3 THEN 'wednesday'
      WHEN 4 THEN 'thursday'
      WHEN 5 THEN 'friday'
      WHEN 6 THEN 'saturday'
      ELSE 'monday'
    END
  );

ALTER TABLE schedules
  ADD CONSTRAINT schedules_day_of_week_check CHECK (
    day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
  );
