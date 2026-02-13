const express = require('express');
const router = express.Router();
const leaveRequestsDb = require('../db/leaveRequests');
const leaveBalancesDb = require('../db/leaveBalances');

/**
 * @swagger
 * /leave/requests:
 *   get:
 *     tags: [Leave]
 *     summary: List leave requests (optional employeeId filter)
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of leave requests
 */
router.get('/requests', async (req, res) => {
  try {
    const list = await leaveRequestsDb.findAll(req.query.employeeId || null);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /leave/requests:
 *   post:
 *     tags: [Leave]
 *     summary: Create leave request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, type, startDate, endDate]
 *             properties:
 *               employeeId: { type: string }
 *               type: { type: string, example: vacation }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Leave request created }
 */
router.post('/requests', async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, reason } = req.body || {};
    if (!employeeId || !type || !startDate || !endDate) return res.status(400).json({ error: 'employeeId, type, startDate, endDate required' });
    const request = await leaveRequestsDb.create({ employeeId, type, startDate, endDate, reason });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /leave/requests/{id}:
 *   put:
 *     tags: [Leave]
 *     summary: Update leave request (e.g. status approved or rejected)
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
 *               status: { type: string, enum: [pending, approved, rejected] }
 *               startDate: { type: string }
 *               endDate: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put('/requests/:id', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.body || {};
    const updated = await leaveRequestsDb.update(req.params.id, { status, startDate, endDate });
    if (!updated) return res.status(404).json({ error: 'Leave request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /leave/balance:
 *   get:
 *     tags: [Leave]
 *     summary: Get leave balance(s). Query by employeeId and optionally year, leaveType
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: leaveType
 *         schema: { type: string }
 *     responses:
 *       200: { description: Leave balance(s) }
 */
router.get('/balance', async (req, res) => {
  try {
    const { employeeId, year, leaveType } = req.query;
    if (!employeeId) return res.status(400).json({ error: 'employeeId required' });
    const list = await leaveBalancesDb.findForEmployee(
      employeeId,
      year ? Number(year) : null,
      leaveType || null
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /leave/balance:
 *   post:
 *     tags: [Leave]
 *     summary: Creditation of leave (add/ set leave balance)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, leaveType, balance, year]
 *             properties:
 *               employeeId: { type: string }
 *               leaveType: { type: string }
 *               balance: { type: number }
 *               year: { type: integer }
 *     responses:
 *       201: { description: Leave balance created/credited }
 */
router.post('/balance', async (req, res) => {
  try {
    const { employeeId, leaveType, balance, year } = req.body || {};
    if (!employeeId || !leaveType || balance == null || !year) return res.status(400).json({ error: 'employeeId, leaveType, balance, year required' });
    const record = await leaveBalancesDb.upsert({ employeeId, leaveType, balance, year });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /leave/balance/update:
 *   put:
 *     tags: [Leave]
 *     summary: Update leave balance (e.g. after approval)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, leaveType, year]
 *             properties:
 *               employeeId: { type: string }
 *               leaveType: { type: string }
 *               year: { type: integer }
 *               balance: { type: number }
 *               delta: { type: number, description: "Change to apply (e.g. -1)" }
 *     responses:
 *       200: { description: Updated balance }
 *       404: { description: Not found }
 */
router.put('/balance/update', async (req, res) => {
  try {
    const { employeeId, leaveType, year, balance, delta } = req.body || {};
    if (!employeeId || !leaveType || !year) return res.status(400).json({ error: 'employeeId, leaveType, year required' });
    let result = null;
    if (balance !== undefined) result = await leaveBalancesDb.setBalance(employeeId, leaveType, year, balance);
    if (delta !== undefined) result = await leaveBalancesDb.updateBalance(employeeId, leaveType, year, delta);
    if (!result) return res.status(404).json({ error: 'Leave balance not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
