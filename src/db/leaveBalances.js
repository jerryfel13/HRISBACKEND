const { pool, toCamel } = require('../config/database');

async function findForEmployee(employeeId, year = null, leaveType = null) {
  let query = 'SELECT employee_id, leave_type, year, balance FROM leave_balances WHERE employee_id = $1';
  const params = [employeeId];
  let i = 2;
  if (year != null) { query += ` AND year = $${i++}`; params.push(Number(year)); }
  if (leaveType) { query += ` AND leave_type = $${i++}`; params.push(leaveType); }
  query += ' ORDER BY year DESC, leave_type';
  const { rows } = await pool.query(query, params);
  return rows.map(toCamel);
}

async function upsert({ employeeId, leaveType, balance, year }) {
  const { rows } = await pool.query(
    `INSERT INTO leave_balances (employee_id, leave_type, year, balance) VALUES ($1, $2, $3, $4)
     ON CONFLICT (employee_id, leave_type, year) DO UPDATE SET balance = $4
     RETURNING employee_id, leave_type, year, balance`,
    [employeeId, leaveType, Number(balance), Number(year)]
  );
  return toCamel(rows[0]);
}

async function findOne(employeeId, leaveType, year) {
  const { rows } = await pool.query(
    'SELECT employee_id, leave_type, year, balance FROM leave_balances WHERE employee_id = $1 AND leave_type = $2 AND year = $3',
    [employeeId, leaveType, Number(year)]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function updateBalance(employeeId, leaveType, year, balanceDelta) {
  const { rows } = await pool.query(
    `UPDATE leave_balances SET balance = balance + $1 WHERE employee_id = $2 AND leave_type = $3 AND year = $4
     RETURNING employee_id, leave_type, year, balance`,
    [Number(balanceDelta), employeeId, leaveType, Number(year)]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

async function setBalance(employeeId, leaveType, year, balance) {
  const { rows } = await pool.query(
    `UPDATE leave_balances SET balance = $1 WHERE employee_id = $2 AND leave_type = $3 AND year = $4
     RETURNING employee_id, leave_type, year, balance`,
    [Number(balance), employeeId, leaveType, Number(year)]
  );
  return rows[0] ? toCamel(rows[0]) : null;
}

module.exports = { findForEmployee, upsert, findOne, updateBalance, setBalance };
