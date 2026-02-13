const { pool, toCamel } = require('../config/database');

async function findAll() {
  const { rows } = await pool.query('SELECT id, name, date, type FROM holidays ORDER BY date');
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query('SELECT id, name, date, type FROM holidays WHERE id = $1', [id]);
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create({ name, date, type = 'regular' }) {
  const { rows } = await pool.query(
    'INSERT INTO holidays (name, date, type) VALUES ($1, $2, $3) RETURNING id, name, date, type',
    [name, date, type]
  );
  return toCamel(rows[0]);
}

async function update(id, { name, date, type }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
  if (date !== undefined) { updates.push(`date = $${i++}`); values.push(date); }
  if (type !== undefined) { updates.push(`type = $${i++}`); values.push(type); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE holidays SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, name, date, type`,
    values
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM holidays WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
