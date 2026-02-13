const { pool, toCamel } = require('../config/database');

async function findAll(employeeId = null) {
  let query = 'SELECT id, employee_id, day_of_week, start_time, end_time FROM schedules';
  const params = [];
  if (employeeId) {
    query += ' WHERE employee_id = $1';
    params.push(employeeId);
  }
  query += ' ORDER BY employee_id, day_of_week';
  const { rows } = await pool.query(query, params);
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, day_of_week, start_time, end_time FROM schedules WHERE id = $1',
    [id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create({ employeeId, dayOfWeek, startTime, endTime }) {
  const { rows } = await pool.query(
    `INSERT INTO schedules (employee_id, day_of_week, start_time, end_time)
     VALUES ($1, $2, $3, $4) RETURNING id, employee_id, day_of_week, start_time, end_time`,
    [employeeId, Number(dayOfWeek), startTime, endTime]
  );
  return toCamel(rows[0]);
}

async function update(id, { employeeId, dayOfWeek, startTime, endTime }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (employeeId !== undefined) { updates.push(`employee_id = $${i++}`); values.push(employeeId); }
  if (dayOfWeek !== undefined) { updates.push(`day_of_week = $${i++}`); values.push(dayOfWeek); }
  if (startTime !== undefined) { updates.push(`start_time = $${i++}`); values.push(startTime); }
  if (endTime !== undefined) { updates.push(`end_time = $${i++}`); values.push(endTime); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE schedules SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, employee_id, day_of_week, start_time, end_time`,
    values
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
