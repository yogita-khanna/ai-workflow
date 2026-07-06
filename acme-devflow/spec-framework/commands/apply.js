const fs = require('fs');
const path = require('path');

const ticketId = process.argv[2];
if (!ticketId) {
  console.error('Error: Please provide a ticket ID (e.g., DEV-012).');
  process.exit(1);
}

console.log(`\x1b[36m=== DevFlow Apply: ${ticketId} ===\x1b[0m`);

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const ticketDir = path.join(workspaceRoot, 'tickets', ticketId);

if (!fs.existsSync(ticketDir)) {
  console.error(`Error: Ticket directory not found at tickets/${ticketId}. Did you run propose first?`);
  process.exit(1);
}

const specPath = path.join(ticketDir, 'spec.md');
const designPath = path.join(ticketDir, 'design.md');
const tasksPath = path.join(ticketDir, 'tasks.md');

if (!fs.existsSync(specPath) || !fs.existsSync(designPath) || !fs.existsSync(tasksPath)) {
  console.error('Error: Spec, Design, or Tasks files are missing in the ticket folder.');
  process.exit(1);
}

// Read spec and design status
const specContent = fs.readFileSync(specPath, 'utf8');
const designContent = fs.readFileSync(designPath, 'utf8');

const isSpecApproved = specContent.includes('Status: Approved');
const isDesignApproved = designContent.includes('Status: Approved');

if (!isSpecApproved) {
  console.log(`\x1b[33mWarning: Spec status is not set to 'Approved' in tickets/${ticketId}/spec.md.\x1b[0m`);
  console.log(`Please make sure Checkpoint #1 (Spec Approval) is signed off by a human.`);
}

if (!isDesignApproved) {
  console.log(`\x1b[33mWarning: Design status is not set to 'Approved' in tickets/${ticketId}/design.md.\x1b[0m`);
  console.log(`Please make sure Checkpoint #2 (Design Approval) is signed off by a senior engineer.`);
}

// Propose branch name
const branchName = `agent/${ticketId.toLowerCase()}-impl`;
console.log(`\nReady to transition to implementation branch: \x1b[32m${branchName}\x1b[0m`);
console.log('Suggested Git actions:');
console.log(`  git checkout -b ${branchName}`);
console.log(`  pnpm install`);

console.log(`\n\x1b[32m[Phase 5: Implementation Started]\x1b[0m`);
console.log(`Ensure you run the TDD loop (RED -> GREEN) for all checklist items in tickets/${ticketId}/tasks.md.`);
