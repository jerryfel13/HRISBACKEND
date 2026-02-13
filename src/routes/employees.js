const express = require('express');
const router = express.Router();
const employeesDb = require('../db/employees');

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [Employees]
 *     summary: List all employees
 *     responses:
 *       200:
 *         description: List of employee profiles
 */
router.get('/', async (req, res) => {
  try {
    const list = await employeesDb.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Employee profile }
 *       404: { description: Not found }
 */
router.get('/:id', async (req, res) => {
  try {
    const e = await employeesDb.findById(req.params.id);
    if (!e) return res.status(404).json({ error: 'Employee not found' });
    res.json(e);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /employees:
 *   post:
 *     tags: [Employees]
 *     summary: Create employee profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               department: { type: string }
 *               position: { type: string }
 *               hireDate: { type: string, format: date }
 *     responses:
 *       201: { description: Created employee }
 */
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, department, position, hireDate } = req.body || {};
    if (!firstName || !lastName || !email) return res.status(400).json({ error: 'firstName, lastName, email required' });
    const employee = await employeesDb.create({ firstName, lastName, email, department, position, hireDate });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Update employee profile
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
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               department: { type: string }
 *               position: { type: string }
 *               hireDate: { type: string, format: date }
 *     responses:
 *       200: { description: Updated employee }
 *       404: { description: Not found }
 */
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, department, position, hireDate } = req.body || {};
    const updated = await employeesDb.update(req.params.id, { firstName, lastName, email, department, position, hireDate });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete employee profile
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
    const deleted = await employeesDb.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
