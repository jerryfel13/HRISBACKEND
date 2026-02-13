require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'hris',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

function toCamel(row) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  const timestampKeys = /_(at|in|out)$/;
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (v instanceof Date) {
      out[camel] = timestampKeys.test(k) ? v.toISOString() : v.toISOString().slice(0, 10);
    } else {
      out[camel] = v;
    }
  }
  return out;
}

function formatDate(val) {
  if (val == null) return null;
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function formatTimestamp(val) {
  if (val == null) return null;
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

module.exports = { pool, toCamel, formatDate, formatTimestamp };
