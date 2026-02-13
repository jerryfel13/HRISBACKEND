const { pool, toCamel } = require('../config/database');

async function findAll(employeeId = null, type = null) {
  let query = 'SELECT id, employee_id, type, title, description, date, score FROM rank_files';
  const params = [];
  let i = 1;
  if (employeeId) { query += ` WHERE employee_id = $${i++}`; params.push(employeeId); }
  if (type) { query += (employeeId ? ' AND' : ' WHERE') + ` type = $${i++}`; params.push(type); }
  query += ' ORDER BY date DESC NULLS LAST';
  const { rows } = await pool.query(query, params);
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, type, title, description, date, score FROM rank_files WHERE id = $1',
    [id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create({ employeeId, type, title, description = '', date = null, score = null }) {
  const { rows } = await pool.query(
    `INSERT INTO rank_files (employee_id, type, title, description, date, score)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, employee_id, type, title, description, date, score`,
    [employeeId, type, title, description, date, score]
  );
  return toCamel(rows[0]);
}

async function update(id, { type, title, description, date, score }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (type !== undefined) { updates.push(`type = $${i++}`); values.push(type); }
  if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
  if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
  if (date !== undefined) { updates.push(`date = $${i++}`); values.push(date); }
  if (score !== undefined) { updates.push(`score = $${i++}`); values.push(score); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE rank_files SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, employee_id, type, title, description, date, score`,
    values
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM rank_files WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
