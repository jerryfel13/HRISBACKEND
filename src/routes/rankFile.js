const express = require('express');
const router = express.Router();
const rankFilesDb = require('../db/rankFiles');

/**
 * @swagger
 * /rank-file:
 *   get:
 *     tags: [Rank & File]
 *     summary: List rank and file records (achievements, trainings, certifications, evaluations). Optional employeeId, type filter.
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [achievement, training, certification, evaluation] }
 *     responses:
 *       200:
 *         description: List of rank and file records
 */
router.get('/', async (req, res) => {
  try {
    const list = await rankFilesDb.findAll(req.query.employeeId || null, req.query.type || null);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /rank-file/{id}:
 *   get:
 *     tags: [Rank & File]
 *     summary: Get rank and file record by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const r = await rankFilesDb.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Rank and file record not found' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /rank-file:
 *   post:
 *     tags: [Rank & File]
 *     summary: Create record (achievement, training, certification, or evaluation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, type, title]
 *             properties:
 *               employeeId: { type: string }
 *               type: { type: string, enum: [achievement, training, certification, evaluation] }
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date }
 *               score: { type: number }
 *     responses:
 *       201: { description: Created }
 */
router.post('/', async (req, res) => {
  try {
    const { employeeId, type, title, description, date, score } = req.body || {};
    if (!employeeId || !type || !title) return res.status(400).json({ error: 'employeeId, type, title required' });
    const validTypes = ['achievement', 'training', 'certification', 'evaluation'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'type must be one of: ' + validTypes.join(', ') });
    const record = await rankFilesDb.create({ employeeId, type, title, description, date, score });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /rank-file/{id}:
 *   put:
 *     tags: [Rank & File]
 *     summary: Update rank and file record
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
 *               type: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string }
 *               score: { type: number }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
  try {
    const { type, title, description, date, score } = req.body || {};
    const updated = await rankFilesDb.update(req.params.id, { type, title, description, date, score });
    if (!updated) return res.status(404).json({ error: 'Rank and file record not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /rank-file/{id}:
 *   delete:
 *     tags: [Rank & File]
 *     summary: Delete rank and file record
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
    const deleted = await rankFilesDb.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Rank and file record not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
