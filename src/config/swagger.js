const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'HRIS Backend REST API',
      version: '1.0.0',
      description: 'Human Resources Information System - Holiday, Employee Profile, Schedule, Clock In/Out, Leave & Absence, Payroll, Rank & File (evaluations, trainings, certifications)',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development' }],
    tags: [
      { name: 'Holidays', description: 'Holiday management' },
      { name: 'Employees', description: 'Employee profile information' },
      { name: 'Schedules', description: 'Schedule management for employees' },
      { name: 'Time Tracking', description: 'Clock in / clock out' },
      { name: 'Leave', description: 'Leave and absence management' },
      { name: 'Payroll', description: 'Payroll processing' },
      { name: 'Rank & File', description: 'Employee evaluation, achievements, trainings, certifications' },
    ],
    components: {
      schemas: {
        Holiday: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            name: { type: 'string', example: 'New Year' },
            date: { type: 'string', format: 'date', example: '2025-01-01' },
            type: { type: 'string', enum: ['regular', 'special'], example: 'regular' },
          },
        },
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            department: { type: 'string' },
            position: { type: 'string' },
            hireDate: { type: 'string', format: 'date' },
          },
        },
        Schedule: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            dayOfWeek: { type: 'array', items: { type: 'string', enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] }, example: ['monday','tuesday','wednesday','thursday','friday'] },
            startTime: { type: 'string', example: '09:00' },
            endTime: { type: 'string', example: '17:00' },
          },
        },
        ClockRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            clockIn: { type: 'string', format: 'date-time' },
            clockOut: { type: 'string', format: 'date-time' },
            date: { type: 'string', format: 'date' },
          },
        },
        LeaveRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            type: { type: 'string', example: 'vacation' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
          },
        },
        LeaveBalance: {
          type: 'object',
          properties: {
            employeeId: { type: 'string' },
            leaveType: { type: 'string' },
            balance: { type: 'number' },
            year: { type: 'integer' },
          },
        },
        PayrollRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            periodStart: { type: 'string', format: 'date' },
            periodEnd: { type: 'string', format: 'date' },
            grossSalary: { type: 'number' },
            deductions: { type: 'number' },
            netSalary: { type: 'number' },
          },
        },
        RankFile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            type: { type: 'string', enum: ['achievement', 'training', 'certification', 'evaluation'] },
            title: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date' },
            score: { type: 'number' },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
};

module.exports = swaggerJsdoc(options);
