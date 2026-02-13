const { pool, toCamel } = require('../config/database');

async function findAll() {
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name, email, department, position, hire_date FROM employees ORDER BY last_name, first_name'
  );
  return rows.map(toCamel);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name, email, department, position, hire_date FROM employees WHERE id = $1',
    [id]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function create({ firstName, lastName, email, department = '', position = '', hireDate = null }) {
  const { rows } = await pool.query(
    `INSERT INTO employees (first_name, last_name, email, department, position, hire_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, department, position, hire_date`,
    [firstName, lastName, email, department, position, hireDate]
  );
  return toCamel(rows[0]);
}

async function update(id, { firstName, lastName, email, department, position, hireDate }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (firstName !== undefined) { updates.push(`first_name = $${i++}`); values.push(firstName); }
  if (lastName !== undefined) { updates.push(`last_name = $${i++}`); values.push(lastName); }
  if (email !== undefined) { updates.push(`email = $${i++}`); values.push(email); }
  if (department !== undefined) { updates.push(`department = $${i++}`); values.push(department); }
  if (position !== undefined) { updates.push(`position = $${i++}`); values.push(position); }
  if (hireDate !== undefined) { updates.push(`hire_date = $${i++}`); values.push(hireDate); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE employees SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, first_name, last_name, email, department, position, hire_date`,
    values
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM employees WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
