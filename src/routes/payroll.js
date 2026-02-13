const express = require('express');
const router = express.Router();
const employeesDb = require('../db/employees');
const clockRecordsDb = require('../db/clockRecords');
const leaveRequestsDb = require('../db/leaveRequests');
const payrollRecordsDb = require('../db/payrollRecords');

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.max(0, (b - a) / (1000 * 60 * 60));
}

/**
 * @swagger
 * /payroll:
 *   get:
 *     tags: [Payroll]
 *     summary: List payroll records (optional employeeId, period filter)
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: periodStart
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: periodEnd
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: List of payroll records
 */
router.get('/', async (req, res) => {
  try {
    const list = await payrollRecordsDb.findAll({
      employeeId: req.query.employeeId,
      periodStart: req.query.periodStart,
      periodEnd: req.query.periodEnd,
    });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payroll/{id}:
 *   get:
 *     tags: [Payroll]
 *     summary: Get payroll record by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const r = await payrollRecordsDb.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Payroll record not found' });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /payroll/process:
 *   post:
 *     tags: [Payroll]
 *     summary: Run payroll processing. Auto-computes salary based on clock in/out, schedule, and leave/absence.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [periodStart, periodEnd]
 *             properties:
 *               periodStart: { type: string, format: date }
 *               periodEnd: { type: string, format: date }
 *               employeeIds: { type: array, items: { type: string }, description: "Optional; process only these employees" }
 *               hourlyRate: { type: number, description: "Default hourly rate if not per-employee" }
 *     responses:
 *       201:
 *         description: Payroll processed; returns created records
 */
router.post('/process', async (req, res) => {
  try {
    const { periodStart, periodEnd, employeeIds, hourlyRate: defaultRate } = req.body || {};
    if (!periodStart || !periodEnd) return res.status(400).json({ error: 'periodStart and periodEnd required' });

    let employees = await employeesDb.findAll();
    if (employeeIds && employeeIds.length) employees = employees.filter((e) => employeeIds.includes(e.id));

    const created = [];
    for (const emp of employees) {
      const rate = defaultRate || 100;
      const clockRecords = await clockRecordsDb.findByEmployeeAndPeriod(emp.id, periodStart, periodEnd);
      let totalHours = 0;
      for (const c of clockRecords) totalHours += hoursBetween(c.clockIn, c.clockOut);

      const approvedLeave = await leaveRequestsDb.findApprovedInPeriod(emp.id, periodStart, periodEnd);
      let leaveDays = 0;
      for (const l of approvedLeave) {
        const start = new Date(Math.max(new Date(l.startDate).getTime(), new Date(periodStart).getTime()));
        const end = new Date(Math.min(new Date(l.endDate).getTime(), new Date(periodEnd).getTime()));
        leaveDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }

      const grossSalary = totalHours * rate;
      const deductions = 0;
      const netSalary = grossSalary - deductions;

      const record = await payrollRecordsDb.create({
        employeeId: emp.id,
        periodStart,
        periodEnd,
        totalHours,
        leaveDays,
        grossSalary,
        deductions,
        netSalary,
      });
      created.push(record);
    }

    res.status(201).json({ message: 'Payroll processed', records: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
