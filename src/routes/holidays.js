const express = require('express');
const router = express.Router();
const holidaysDb = require('../db/holidays');

/**
 * @swagger
 * /holidays:
 *   get:
 *     tags: [Holidays]
 *     summary: List all holidays
 *     responses:
 *       200:
 *         description: List of holidays
 */
router.get('/', async (req, res) => {
  try {
    const list = await holidaysDb.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /holidays/{id}:
 *   get:
 *     tags: [Holidays]
 *     summary: Get holiday by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Holiday }
 *       404: { description: Not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const h = await holidaysDb.findById(req.params.id);
    if (!h) return res.status(404).json({ error: 'Holiday not found' });
    res.json(h);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /holidays:
 *   post:
 *     tags: [Holidays]
 *     summary: Create holiday
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, date]
 *             properties:
 *               name: { type: string }
 *               date: { type: string, format: date }
 *               type: { type: string, enum: [regular, special] }
 *     responses:
 *       201: { description: Created holiday }
 */
router.post('/', async (req, res) => {
  try {
    const { name, date, type = 'regular' } = req.body || {};
    if (!name || !date) return res.status(400).json({ error: 'name and date required' });
    const holiday = await holidaysDb.create({ name, date, type });
    res.status(201).json(holiday);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /holidays/{id}:
 *   put:
 *     tags: [Holidays]
 *     summary: Update holiday
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
 *               name: { type: string }
 *               date: { type: string, format: date }
 *               type: { type: string, enum: [regular, special] }
 *     responses:
 *       200: { description: Updated holiday }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, date, type } = req.body || {};
    const updated = await holidaysDb.update(req.params.id, { name, date, type });
    if (!updated) return res.status(404).json({ error: 'Holiday not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /holidays/{id}:
 *   delete:
 *     tags: [Holidays]
 *     summary: Delete holiday
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
    const deleted = await holidaysDb.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Holiday not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
