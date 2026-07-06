const fs = require('fs');
const path = require('path');

const ticketId = process.argv[2];
if (!ticketId) {
  console.error('Error: Please provide a ticket ID (e.g., DEV-012).');
  process.exit(1);
}

console.log(`\x1b[36m=== DevFlow Propose: ${ticketId} ===\x1b[0m`);

// Paths
const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const ticketDir = path.join(workspaceRoot, 'tickets', ticketId);
const templatesDir = path.join(workspaceRoot, 'acme-devflow', 'spec-framework', 'templates');

// Create tickets dir if not exists
if (!fs.existsSync(ticketDir)) {
  fs.mkdirSync(ticketDir, { recursive: true });
}

// Copy templates
const templatesToCopy = {
  'spec.md': 'spec.md',
  'design.md': 'design.md',
  'tasks.md': 'tasks.md'
};

Object.entries(templatesToCopy).forEach(([srcName, destName]) => {
  const srcPath = path.join(templatesDir, srcName);
  const destPath = path.join(ticketDir, destName);
  if (!fs.existsSync(destPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    // Simple placeholder replacement
    content = content.replace(/<Ticket ID>/g, ticketId)
                     .replace(/\[TICKET-ID\]/g, ticketId)
                     .replace(/<YYYY-MM-DD>/g, new Date().toISOString().split('T')[0]);
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Created: ${destName}`);
  } else {
    console.log(`Exists: ${destName} (skipping creation)`);
  }
});

// Run Classification
const keyword = ticketId.toLowerCase();
let risk = 'Low';
let reversibility = 'High';
let precedent = 'Yes';
let verdict = 'auto-apply';
let reason = 'Standard UI copy change or non-critical improvement.';

if (keyword.includes('auth') || keyword.includes('payment') || keyword.includes('forgot') || keyword.includes('delete') || keyword.includes('schema') || keyword.includes('db') || keyword.includes('migration')) {
  risk = 'High';
  reversibility = 'Low';
  precedent = 'No';
  verdict = 'ask-human';
  reason = 'Touches authentication/database/schema migrations or contains potentially destructive operations.';
}

console.log(`\n\x1b[33m--- Classification Report for ${ticketId} ---\x1b[0m`);
console.log(`- Risk Score: \x1b[1m${risk}\x1b[0m`);
console.log(`- Reversibility: \x1b[1m${reversibility}\x1b[0m`);
console.log(`- Precedent: \x1b[1m${precedent}\x1b[0m`);
console.log(`- Final Verdict: \x1b[1m\x1b[31m${verdict}\x1b[0m`);
console.log(`- Reasoning: ${reason}\n`);

if (verdict === 'ask-human') {
  console.log(`\x1b[31m[CHECKPOINT #1 - Spec Approval Required]\x1b[0m`);
  console.log(`Halted. A human reviewer must approve the spec at tickets/${ticketId}/spec.md before proceeding.`);
} else {
  console.log(`\x1b[32m[Auto-Apply Approved]\x1b[0m`);
  console.log(`You may transition directly to design drafting and implementation planning.`);
}
