const { pool, toCamel } = require('../config/database');

async function findAll(employeeId = null) {
  let query = 'SELECT id, employee_id, type, start_date, end_date, reason, status FROM leave_requests';
  const params = [];
  if (employeeId) {
    query += ' WHERE employee_id = $1';
    params.push(employeeId);
  }
  query += ' ORDER BY start_date DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, type, start_date, end_date, reason, status FROM leave_requests WHERE id = $1',
    [id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create({ employeeId, type, startDate, endDate, reason = '', status = 'pending' }) {
  const { rows } = await pool.query(
    `INSERT INTO leave_requests (employee_id, type, start_date, end_date, reason, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, employee_id, type, start_date, end_date, reason, status`,
    [employeeId, type, startDate, endDate, reason, status]
  );
  return toCamel(rows[0]);
}

async function update(id, { status, startDate, endDate }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (status !== undefined) { updates.push(`status = $${i++}`); values.push(status); }
  if (startDate !== undefined) { updates.push(`start_date = $${i++}`); values.push(startDate); }
  if (endDate !== undefined) { updates.push(`end_date = $${i++}`); values.push(endDate); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE leave_requests SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, employee_id, type, start_date, end_date, reason, status`,
    values
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function findApprovedInPeriod(employeeId, periodStart, periodEnd) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, type, start_date, end_date, reason, status FROM leave_requests WHERE employee_id = $1 AND status = $2 AND start_date <= $3 AND end_date >= $4',
    [employeeId, 'approved', periodEnd, periodStart]
  );
  return rows.map(toCamel);
}

module.exports = { findAll, findById, create, update, findApprovedInPeriod };
