-- Drop tables that are NOT used by the HRIS backend app.
-- Our app uses only: holidays, employees, schedules, clock_records, leave_requests,
-- leave_balances, payroll_records, rank_files.
--
-- BACKUP first if you might need data from these tables.
-- Run this in DBeaver connected to the same database your app uses (e.g. postgres or hris).

-- Drop in order to respect foreign keys (child tables first).
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS subject_schedules CASCADE;
DROP TABLE IF EXISTS manual_attendance_codes CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
