#!/usr/bin/env node
/**
 * Check the day_of_week column type in schedules table.
 * Uses the same DB config as your backend - run: node scripts/check-schedules-column.js
 */
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

async function check() {
  try {
    const { rows } = await pool.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'day_of_week'
    `);
    console.log('Database:', process.env.PGDATABASE || process.env.DATABASE_URL?.split('/').pop() || 'hris');
    console.log('Host:', process.env.PGHOST || 'localhost');
    if (rows.length === 0) {
      console.log('Column day_of_week: NOT FOUND');
    } else {
      console.log('Column day_of_week:', rows[0].data_type, '(' + rows[0].udt_name + ')');
      if (rows[0].data_type === 'ARRAY' || rows[0].udt_name === '_text') {
        console.log('-> Already TEXT[]. Run migrate_day_of_week_constraint_only.sql if constraint is missing.');
      } else if (rows[0].data_type === 'smallint') {
        console.log('-> Still SMALLINT. Run migrate_day_of_week_final.sql to convert.');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
