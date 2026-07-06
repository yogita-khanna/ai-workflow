const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'database.json');

// Ensure database file exists
function initDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ tickets: {}, auditLogs: [] }, null, 2), 'utf8');
  }
}

function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { tickets: {}, auditLogs: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function getTicket(ticketId) {
  const db = readDb();
  return db.tickets[ticketId] || {
    id: ticketId,
    state: 'INTAKE',
    assignee: 'Unassigned',
    specApproved: false,
    designApproved: false,
    reviewApproved: false,
    prMerged: false
  };
}

function saveTicket(ticketId, ticketData) {
  const db = readDb();
  db.tickets[ticketId] = {
    ...getTicket(ticketId),
    ...ticketData
  };
  writeDb(db);
}

function logAudit(ticketId, action, user, details = '') {
  const db = readDb();
  const entry = {
    ticketId,
    action,
    user,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.push(entry);
  writeDb(db);
}

function getAuditLogs(ticketId) {
  const db = readDb();
  return db.auditLogs.filter(log => log.ticketId === ticketId);
}

module.exports = {
  getTicket,
  saveTicket,
  logAudit,
  getAuditLogs
};
