const { v4: uuidv4 } = require('uuid');

const stores = {
  holidays: [],
  employees: [],
  schedules: [],
  clockRecords: [],
  leaveRequests: [],
  leaveBalances: [],
  payrollRecords: [],
  rankFiles: [],
};

function createId() {
  return uuidv4();
}

module.exports = { stores, createId };
