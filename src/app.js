const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const holidaysRouter = require('./routes/holidays');
const employeesRouter = require('./routes/employees');
const schedulesRouter = require('./routes/schedules');
const timeTrackingRouter = require('./routes/timeTracking');
const leaveRouter = require('./routes/leave');
const payrollRouter = require('./routes/payroll');
const rankFileRouter = require('./routes/rankFile');

const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Landing page and static assets (logo, etc.)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// REST API
app.use('/holidays', holidaysRouter);
app.use('/employees', employeesRouter);
app.use('/schedules', schedulesRouter);
app.use('/time-tracking', timeTrackingRouter);
app.use('/leave', leaveRouter);
app.use('/payroll', payrollRouter);
app.use('/rank-file', rankFileRouter);

// Swagger UI – REST API guide
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

// OpenAPI JSON (optional, for external tools)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = app;
