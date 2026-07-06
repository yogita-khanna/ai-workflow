const process = require('process');
const Orchestrator = require('./orchestrator');
const db = require('./db');

const args = process.argv.slice(2);
const command = args[0];
const ticketId = args[1];

const availableCommands = [
  'init', 'propose', 'approve-spec', 'design', 'approve-design',
  'implement', 'review', 'approve-review', 'document', 'merge',
  'archive', 'status'
];

if (!command || !availableCommands.includes(command)) {
  console.log('Usage: node index.js <command> <ticket-id>');
  console.log('Available commands:');
  availableCommands.forEach(cmd => console.log(`  - ${cmd}`));
  process.exit(1);
}

if (!ticketId) {
  console.error('Error: Please provide a ticket ID (e.g., DEV-123).');
  process.exit(1);
}

const orchestrator = new Orchestrator(ticketId);

switch (command) {
  case 'init':
    orchestrator.init();
    break;
  case 'propose':
    orchestrator.propose();
    break;
  case 'approve-spec':
    orchestrator.approveSpec();
    break;
  case 'design':
    orchestrator.design();
    break;
  case 'approve-design':
    orchestrator.approveDesign();
    break;
  case 'implement':
    orchestrator.implement();
    break;
  case 'review':
    orchestrator.review();
    break;
  case 'approve-review':
    orchestrator.approveReview();
    break;
  case 'document':
    orchestrator.document();
    break;
  case 'merge':
    orchestrator.merge();
    break;
  case 'archive':
    orchestrator.archive();
    break;
  case 'status':
    console.log(`\n\x1b[36m=== Status for ${ticketId} ===\x1b[0m`);
    console.log(`State: \x1b[1m${orchestrator.ticket.state}\x1b[0m`);
    console.log(`Checkpoint 1 (Spec): ${orchestrator.ticket.specApproved ? '\x1b[32mApproved\x1b[0m' : '\x1b[31mPending\x1b[0m'}`);
    console.log(`Checkpoint 2 (Design): ${orchestrator.ticket.designApproved ? '\x1b[32mApproved\x1b[0m' : '\x1b[31mPending\x1b[0m'}`);
    console.log(`Checkpoint 3 (Review): ${orchestrator.ticket.reviewApproved ? '\x1b[32mApproved\x1b[0m' : '\x1b[31mPending\x1b[0m'}`);
    console.log(`Checkpoint 4 (Merge): ${orchestrator.ticket.prMerged ? '\x1b[32mMerged\x1b[0m' : '\x1b[31mPending\x1b[0m'}`);
    
    const logs = db.getAuditLogs(ticketId);
    console.log('\n\x1b[33m--- Audit Log History ---\x1b[0m');
    logs.forEach(log => {
      console.log(`[${log.timestamp.split('T')[1].slice(0,8)}] \x1b[1m${log.action}\x1b[0m - ${log.details}`);
    });
    console.log();
    break;
}
