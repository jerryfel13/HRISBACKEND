-- Migration: Add unique constraint to prevent duplicate schedules per employee/day/time
-- Run this against your hris database. Removes existing duplicates first.

-- 1. Remove duplicate rows (keep one per employee_id, day_of_week, start_time, end_time)
DELETE FROM schedules a USING schedules b
WHERE a.id > b.id
  AND a.employee_id = b.employee_id
  AND a.day_of_week = b.day_of_week
  AND a.start_time = b.start_time
  AND a.end_time = b.end_time;

-- 2. Add unique constraint (prevents same employee having multiple entries for same day + times)
CREATE UNIQUE INDEX IF NOT EXISTS idx_schedules_employee_day_times
  ON schedules (employee_id, day_of_week, start_time, end_time);
