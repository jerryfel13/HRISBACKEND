const express = require('express');
const router = express.Router();
const clockRecordsDb = require('../db/clockRecords');

/**
 * @swagger
 * /time-tracking:
 *   get:
 *     tags: [Time Tracking]
 *     summary: List clock records (optional filter by employeeId, date)
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of clock in/out records
 */
router.get('/', async (req, res) => {
  try {
    const list = await clockRecordsDb.findAll({ employeeId: req.query.employeeId, date: req.query.date });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /time-tracking/{id}:
 *   get:
 *     tags: [Time Tracking]
 *     summary: Get clock record by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const c = await clockRecordsDb.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Clock record not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /time-tracking/clock-in:
 *   post:
 *     tags: [Time Tracking]
 *     summary: Clock in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
 *             properties:
 *               employeeId: { type: string }
 *               date: { type: string, format: date }
 *               clockIn: { type: string, format: date-time }
 *     responses:
 *       201: { description: Clock in recorded }
 */
router.post('/clock-in', async (req, res) => {
  try {
    const { employeeId, date, clockIn } = req.body || {};
    if (!employeeId) return res.status(400).json({ error: 'employeeId required' });
    const d = date || new Date().toISOString().slice(0, 10);
    const ci = clockIn || new Date().toISOString();
    const record = await clockRecordsDb.create({ employeeId, date: d, clockIn: ci, clockOut: null });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /time-tracking/clock-out:
 *   post:
 *     tags: [Time Tracking]
 *     summary: Clock out (updates latest open record for employee/date)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
 *             properties:
 *               employeeId: { type: string }
 *               date: { type: string, format: date }
 *               clockOut: { type: string, format: date-time }
 *     responses:
 *       200: { description: Clock out recorded }
 *       404: { description: No open record found }
 */
router.post('/clock-out', async (req, res) => {
  try {
    const { employeeId, date, clockOut } = req.body || {};
    if (!employeeId) return res.status(400).json({ error: 'employeeId required' });
    const d = date || new Date().toISOString().slice(0, 10);
    const co = clockOut || new Date().toISOString();
    const open = await clockRecordsDb.findOpenRecord(employeeId, d);
    if (!open) return res.status(404).json({ error: 'No open clock-in record found for this employee/date' });
    const updated = await clockRecordsDb.updateClockOut(open.id, co);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /time-tracking/upload:
 *   post:
 *     tags: [Time Tracking]
 *     summary: Upload bulk clock records (e.g. from device)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     employeeId: { type: string }
 *                     date: { type: string }
 *                     clockIn: { type: string }
 *                     clockOut: { type: string }
 *     responses:
 *       201: { description: Records uploaded }
 */
router.post('/upload', async (req, res) => {
  try {
    const { records } = req.body || {};
    if (!Array.isArray(records)) return res.status(400).json({ error: 'records array required' });
    const created = [];
    for (const r of records) {
      const rec = await clockRecordsDb.create({
        employeeId: r.employeeId,
        date: r.date,
        clockIn: r.clockIn || null,
        clockOut: r.clockOut || null,
      });
      created.push(rec);
    }
    res.status(201).json({ created, count: created.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /time-tracking/{id}:
 *   put:
 *     tags: [Time Tracking]
 *     summary: Update clock record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clockIn: { type: string, format: date-time }
 *               clockOut: { type: string, format: date-time }
 *               date: { type: string }
 *     responses:
 *       200: { description: Updated record }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
  try {
    const { clockIn, clockOut, date } = req.body || {};
    const updated = await clockRecordsDb.update(req.params.id, { clockIn, clockOut, date });
    if (!updated) return res.status(404).json({ error: 'Clock record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /time-tracking/{id}:
 *   delete:
 *     tags: [Time Tracking]
 *     summary: Delete clock record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await clockRecordsDb.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Clock record not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
