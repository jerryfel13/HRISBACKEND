const { pool, toCamel } = require('../config/database');

async function findAll(filters = {}) {
  let query = 'SELECT id, employee_id, date, clock_in, clock_out FROM clock_records WHERE 1=1';
  const params = [];
  let i = 1;
  if (filters.employeeId) { query += ` AND employee_id = $${i++}`; params.push(filters.employeeId); }
  if (filters.date) { query += ` AND date = $${i++}`; params.push(filters.date); }
  query += ' ORDER BY date DESC, clock_in DESC';
  const { rows } = await pool.query(query, params);
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, date, clock_in, clock_out FROM clock_records WHERE id = $1',
    [id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create({ employeeId, date, clockIn, clockOut = null }) {
  const { rows } = await pool.query(
    `INSERT INTO clock_records (employee_id, date, clock_in, clock_out)
     VALUES ($1, $2, $3, $4) RETURNING id, employee_id, date, clock_in, clock_out`,
    [employeeId, date, clockIn, clockOut]
  );
  return toCamel(rows[0]);
}

async function findByEmployeeAndPeriod(employeeId, periodStart, periodEnd) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, date, clock_in, clock_out FROM clock_records WHERE employee_id = $1 AND date >= $2 AND date <= $3 AND clock_in IS NOT NULL AND clock_out IS NOT NULL ORDER BY date',
    [employeeId, periodStart, periodEnd]
  );
  return rows.map(toCamel);
}

async function findOpenRecord(employeeId, date) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, date, clock_in, clock_out FROM clock_records WHERE employee_id = $1 AND date = $2 AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1',
    [employeeId, date]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function updateClockOut(id, clockOut) {
  const { rows } = await pool.query(
    'UPDATE clock_records SET clock_out = $1 WHERE id = $2 RETURNING id, employee_id, date, clock_in, clock_out',
    [clockOut, id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function update(id, { clockIn, clockOut, date }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (clockIn !== undefined) { updates.push(`clock_in = $${i++}`); values.push(clockIn); }
  if (clockOut !== undefined) { updates.push(`clock_out = $${i++}`); values.push(clockOut); }
  if (date !== undefined) { updates.push(`date = $${i++}`); values.push(date); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE clock_records SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, employee_id, date, clock_in, clock_out`,
    values
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM clock_records WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, findOpenRecord, updateClockOut, update, remove };
