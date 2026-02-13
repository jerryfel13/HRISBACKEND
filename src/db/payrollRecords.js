const { pool, toCamel } = require('../config/database');

async function findAll(filters = {}) {
  let query = 'SELECT id, employee_id, period_start, period_end, total_hours, leave_days, gross_salary, deductions, net_salary FROM payroll_records WHERE 1=1';
  const params = [];
  let i = 1;
  if (filters.employeeId) { query += ` AND employee_id = $${i++}`; params.push(filters.employeeId); }
  if (filters.periodStart) { query += ` AND period_start >= $${i++}`; params.push(filters.periodStart); }
  if (filters.periodEnd) { query += ` AND period_end <= $${i++}`; params.push(filters.periodEnd); }
  query += ' ORDER BY period_end DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, period_start, period_end, total_hours, leave_days, gross_salary, deductions, net_salary FROM payroll_records WHERE id = $1',
    [id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create(record) {
  const { rows } = await pool.query(
    `INSERT INTO payroll_records (employee_id, period_start, period_end, total_hours, leave_days, gross_salary, deductions, net_salary)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, employee_id, period_start, period_end, total_hours, leave_days, gross_salary, deductions, net_salary`,
    [
      record.employeeId,
      record.periodStart,
      record.periodEnd,
      record.totalHours ?? 0,
      record.leaveDays ?? 0,
      record.grossSalary ?? 0,
      record.deductions ?? 0,
      record.netSalary ?? 0,
    ]
  );
  return toCamel(rows[0]);
}

module.exports = { findAll, findById, create };
