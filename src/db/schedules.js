const { pool, toCamel } = require('../config/database');

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES_BY_NUM = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function dayNameToNum(name) {
  const i = DAY_NAMES_BY_NUM.indexOf(typeof name === 'string' ? name.toLowerCase() : '');
  return i >= 0 ? i : null;
}

function dayNumToName(num) {
  const n = Number(num);
  return n >= 0 && n <= 6 ? DAY_NAMES_BY_NUM[n] : null;
}

function isValidDayOfWeek(day) {
  if (typeof day === 'number') return day >= 0 && day <= 7;
  if (typeof day !== 'string') return false;
  return DAYS_OF_WEEK.includes(day.toLowerCase());
}

function normalizeDayOfWeek(day) {
  if (typeof day === 'number') {
    const n = Math.floor(day);
    if (n >= 1 && n <= 7) return DAY_NAMES_BY_NUM[n % 7];
    if (n >= 0 && n <= 6) return DAY_NAMES_BY_NUM[n];
    return null;
  }
  return typeof day === 'string' ? day.toLowerCase() : null;
}

function isValidDayOfWeekArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every(d => isValidDayOfWeek(d));
}

function normalizeDayOfWeekArray(arr) {
  if (Array.isArray(arr)) {
    return [...new Set(arr.map(d => normalizeDayOfWeek(d)).filter(Boolean))];
  }
  if (typeof arr === 'string' || typeof arr === 'number') {
    const d = normalizeDayOfWeek(arr);
    return d ? [d] : [];
  }
  return [];
}

function daysToSmallintArray(days) {
  return days.map(d => {
    if (typeof d === 'number') {
      const n = Math.floor(d);
      return n >= 1 && n <= 7 ? n % 7 : (n >= 0 && n <= 6 ? n : 1);
    }
    const i = DAY_NAMES_BY_NUM.indexOf(d.toLowerCase());
    return i >= 0 ? i : 1;
  });
}

function rowToResponse(row) {
  if (!row) return null;
  const r = toCamel(row);
  const num = r.dayOfWeek;
  r.dayOfWeek = [num != null ? dayNumToName(num) : null].filter(Boolean);
  return r;
}

async function findAll(employeeId = null) {
  let query = `SELECT DISTINCT ON (employee_id, day_of_week, start_time, end_time) id, employee_id, day_of_week, start_time, end_time FROM schedules`;
  const params = [];
  if (employeeId) {
    query += ' WHERE employee_id = $1';
    params.push(employeeId);
  }
  query += ' ORDER BY employee_id, day_of_week, start_time, end_time, id';
  const { rows } = await pool.query(query, params);
  return rows.map(rowToResponse);
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, employee_id, day_of_week, start_time, end_time FROM schedules WHERE id = $1',
    [id]
  );
  return rows[0] ? rowToResponse(rows[0]) : null;
}

async function create({ employeeId, dayOfWeek, startTime, endTime }) {
  const days = normalizeDayOfWeekArray(dayOfWeek);
  if (!isValidDayOfWeekArray(days)) {
    throw new Error(`dayOfWeek must be a non-empty array of: ${DAYS_OF_WEEK.join(', ')} (or numbers 0-7)`);
  }
  const dayNums = daysToSmallintArray(days);
  let firstRow = null;
  for (let i = 0; i < dayNums.length; i++) {
    const existing = await pool.query(
      `SELECT id FROM schedules WHERE employee_id = $1 AND day_of_week = $2 AND start_time = $3 AND end_time = $4 LIMIT 1`,
      [employeeId, dayNums[i], startTime, endTime]
    );
    if (existing.rows.length > 0) continue;
    const { rows } = await pool.query(
      `INSERT INTO schedules (employee_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4) RETURNING id, employee_id, day_of_week, start_time, end_time`,
      [employeeId, dayNums[i], startTime, endTime]
    );
    if (rows.length > 0 && !firstRow) firstRow = rows[0];
  }
  if (!firstRow) {
    const existing = await pool.query(
      `SELECT id FROM schedules WHERE employee_id = $1 AND day_of_week = $2 AND start_time = $3 AND end_time = $4 LIMIT 1`,
      [employeeId, dayNums[0], startTime, endTime]
    );
    firstRow = existing.rows[0] || { id: null };
  }
  return {
    id: firstRow?.id,
    employeeId,
    dayOfWeek: days,
    startTime,
    endTime,
  };
}

async function update(id, { employeeId, dayOfWeek, startTime, endTime }) {
  const updates = [];
  const values = [];
  let i = 1;
  if (employeeId !== undefined) { updates.push(`employee_id = $${i++}`); values.push(employeeId); }
  if (dayOfWeek !== undefined) {
    const days = normalizeDayOfWeekArray(dayOfWeek);
    if (!isValidDayOfWeekArray(days)) {
      throw new Error(`dayOfWeek must be a non-empty array of: ${DAYS_OF_WEEK.join(', ')}`);
    }
    const dayNums = daysToSmallintArray(days);
    updates.push(`day_of_week = $${i++}`);
    values.push(dayNums[0]);
  }
  if (startTime !== undefined) { updates.push(`start_time = $${i++}`); values.push(startTime); }
  if (endTime !== undefined) { updates.push(`end_time = $${i++}`); values.push(endTime); }
  if (updates.length === 0) return findById(id);
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE schedules SET ${updates.join(', ')} WHERE id = $${i}
     RETURNING id, employee_id, day_of_week, start_time, end_time`,
    values
  );
  return rows[0] ? rowToResponse(rows[0]) : null;
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove, DAYS_OF_WEEK, isValidDayOfWeek, isValidDayOfWeekArray, normalizeDayOfWeekArray };
