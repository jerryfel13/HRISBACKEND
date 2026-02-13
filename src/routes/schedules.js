const express = require('express');
const router = express.Router();
const schedulesDb = require('../db/schedules');

/**
 * @swagger
 * /schedules:
 *   get:
 *     tags: [Schedules]
 *     summary: List all schedules (optional filter by employeeId)
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of schedules
 */
router.get('/', async (req, res) => {
  try {
    const list = await schedulesDb.findAll(req.query.employeeId || null);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     tags: [Schedules]
 *     summary: Get schedule by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Schedule }
 *       404: { description: Not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const s = await schedulesDb.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Schedule not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /schedules:
 *   post:
 *     tags: [Schedules]
 *     summary: Create schedule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, dayOfWeek, startTime, endTime]
 *             properties:
 *               employeeId: { type: string }
 *               dayOfWeek: { type: integer, minimum: 0, maximum: 6 }
 *               startTime: { type: string, example: "09:00" }
 *               endTime: { type: string, example: "17:00" }
 *     responses:
 *       201: { description: Created schedule }
 */
router.post('/', async (req, res) => {
  try {
    const { employeeId, dayOfWeek, startTime, endTime } = req.body || {};
    if (employeeId == null || dayOfWeek == null || !startTime || !endTime) return res.status(400).json({ error: 'employeeId, dayOfWeek, startTime, endTime required' });
    const schedule = await schedulesDb.create({ employeeId, dayOfWeek, startTime, endTime });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     tags: [Schedules]
 *     summary: Update schedule
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
 *               employeeId: { type: string }
 *               dayOfWeek: { type: integer }
 *               startTime: { type: string }
 *               endTime: { type: string }
 *     responses:
 *       200: { description: Updated schedule }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
  try {
    const { employeeId, dayOfWeek, startTime, endTime } = req.body || {};
    const updated = await schedulesDb.update(req.params.id, { employeeId, dayOfWeek, startTime, endTime });
    if (!updated) return res.status(404).json({ error: 'Schedule not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     tags: [Schedules]
 *     summary: Delete schedule
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
    const deleted = await schedulesDb.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
