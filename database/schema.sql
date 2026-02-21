-- HRIS Backend - PostgreSQL schema
-- Run this in DBeaver (or psql) to create the database and tables.
-- 1. Create database first: CREATE DATABASE hris;
-- 2. Connect to the "hris" database (not "postgres").
-- 3. Execute the ENTIRE script (Execute SQL Script / Run script), not single statements.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Holidays
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'regular'
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(255) DEFAULT '',
  position VARCHAR(255) DEFAULT '',
  hire_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules (day_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday - one row per day)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_schedules_employee_id ON schedules(employee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_schedules_employee_day_times ON schedules(employee_id, day_of_week, start_time, end_time);

-- Clock records (time tracking)
-- Run CREATE TABLE and CREATE INDEX together (Execute SQL Script / Alt+X).
CREATE TABLE IF NOT EXISTS clock_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clock_records_employee_date ON clock_records(employee_id, date);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);

-- Leave balances (composite key: employee + type + year)
CREATE TABLE IF NOT EXISTS leave_balances (
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(100) NOT NULL,
  year SMALLINT NOT NULL,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  PRIMARY KEY (employee_id, leave_type, year)
);

-- Payroll records
CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours NUMERIC(10, 2) DEFAULT 0,
  leave_days NUMERIC(10, 2) DEFAULT 0,
  gross_salary NUMERIC(12, 2) DEFAULT 0,
  deductions NUMERIC(12, 2) DEFAULT 0,
  net_salary NUMERIC(12, 2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_payroll_employee_id ON payroll_records(employee_id);

-- Rank & file (achievements, trainings, certifications, evaluations)
-- Run the CREATE TABLE below first; then the CREATE INDEX (table must exist).
CREATE TABLE IF NOT EXISTS rank_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  date DATE,
  score NUMERIC(10, 2),
  CONSTRAINT rank_files_type_check CHECK (type IN ('achievement', 'training', 'certification', 'evaluation'))
);

CREATE INDEX IF NOT EXISTS idx_rank_files_employee_id ON rank_files(employee_id);
