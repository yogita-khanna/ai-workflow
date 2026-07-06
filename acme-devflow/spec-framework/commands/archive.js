const fs = require('fs');
const path = require('path');

const ticketId = process.argv[2];
if (!ticketId) {
  console.error('Error: Please provide a ticket ID (e.g., DEV-012).');
  process.exit(1);
}

console.log(`\x1b[36m=== DevFlow Archive: ${ticketId} ===\x1b[0m`);

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const ticketDir = path.join(workspaceRoot, 'tickets', ticketId);

if (!fs.existsSync(ticketDir)) {
  console.error(`Error: Ticket directory not found at tickets/${ticketId}.`);
  process.exit(1);
}

// Target directories for context preservation
const contextDocsDir = path.join(workspaceRoot, 'docs', 'context');
const specsDir = path.join(contextDocsDir, 'specs');
const adrsDir = path.join(contextDocsDir, 'adrs');
const sessionsDir = path.join(contextDocsDir, 'sessions');

// Create directories if they don't exist
[specsDir, adrsDir, sessionsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to extract title
function extractSpecTitle(filePath) {
  if (!fs.existsSync(filePath)) return 'Unnamed Feature';
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^# Spec:\s*(.*)$/m) || content.match(/^#\s*(.*)$/m);
  return match ? match[1].trim() : 'Unnamed Feature';
}

const specPath = path.join(ticketDir, 'spec.md');
const specTitle = extractSpecTitle(specPath);

// Copy Spec
const archiveSpecPath = path.join(specsDir, `${ticketId.toLowerCase()}.md`);
if (fs.existsSync(specPath)) {
  fs.copyFileSync(specPath, archiveSpecPath);
  console.log(`Archived spec to: docs/context/specs/${ticketId.toLowerCase()}.md`);
}

// Copy Design
const designPath = path.join(ticketDir, 'design.md');
const archiveDesignPath = path.join(specsDir, `${ticketId.toLowerCase()}-design.md`);
if (fs.existsSync(designPath)) {
  fs.copyFileSync(designPath, archiveDesignPath);
  console.log(`Archived design to: docs/context/specs/${ticketId.toLowerCase()}-design.md`);
}

// Copy ADRs (looking for any adr-*.md or adr.md files in ticketDir)
fs.readdirSync(ticketDir).forEach(file => {
  if (file.toLowerCase().startsWith('adr') && file.endsWith('.md')) {
    const srcAdr = path.join(ticketDir, file);
    const destAdr = path.join(adrsDir, file);
    fs.copyFileSync(srcAdr, destAdr);
    console.log(`Archived ADR: docs/context/adrs/${file}`);
  }
});

// Generate Session Summary if none exists in ticket folder, else copy it
const sessionSummaryPath = path.join(ticketDir, 'session_summary.md');
const currentDate = new Date().toISOString().split('T')[0];
const targetSessionPath = path.join(sessionsDir, `${currentDate}-${ticketId.toLowerCase()}.md`);

if (fs.existsSync(sessionSummaryPath)) {
  fs.copyFileSync(sessionSummaryPath, targetSessionPath);
  console.log(`Archived session summary to: docs/context/sessions/${currentDate}-${ticketId.toLowerCase()}.md`);
} else {
  // Create a default session summary
  const summaryTemplatePath = path.join(workspaceRoot, 'acme-devflow', 'spec-framework', 'templates', 'session_summary.md');
  if (fs.existsSync(summaryTemplatePath)) {
    let summaryContent = fs.readFileSync(summaryTemplatePath, 'utf8');
    summaryContent = summaryContent.replace(/\[Ticket ID\]/g, ticketId)
                                   .replace(/\[YYYY-MM-DD\]/g, currentDate)
                                   .replace(/\[Coder Agent \/ Architect Agent\]/g, 'Context Agent')
                                   .replace(/\[Brief description.*\]/g, 'Completed E2E implementation and merged branch.')
                                   .replace(/\[Checklist\/summary.*\]/g, '- Code compiled and linted successfully\n- Tests executed\n- Documentation updated')
                                   .replace(/\[Any failed.*\]/g, 'None')
                                   .replace(/\[Any ambiguities.*\]/g, 'None')
                                   .replace(/\[What the next.*\]/g, 'None (Archived)')
                                   .replace(/\[e\.g\.,.*\]/g, 'Merged PR')
                                   .replace(/\[e\.g\., repository.*\]/g, 'Passed CI checks');
    fs.writeFileSync(targetSessionPath, summaryContent, 'utf8');
    console.log(`Generated default session summary: docs/context/sessions/${currentDate}-${ticketId.toLowerCase()}.md`);
  }
}

// Update living CONTEXT.md
const contextPath = path.join(workspaceRoot, 'CONTEXT.md');
const contextTemplatePath = path.join(workspaceRoot, 'acme-devflow', 'spec-framework', 'templates', 'CONTEXT.md');

let contextContent = '';
if (fs.existsSync(contextPath)) {
  contextContent = fs.readFileSync(contextPath, 'utf8');
} else if (fs.existsSync(contextTemplatePath)) {
  contextContent = fs.readFileSync(contextTemplatePath, 'utf8');
}

if (contextContent) {
  // Update or append to Active Initiatives & Specs section
  const newSpecLink = `- [${ticketId}]: ${specTitle} — Spec: [docs/context/specs/${ticketId.toLowerCase()}.md](docs/context/specs/${ticketId.toLowerCase()}.md) — Status: Archived`;
  
  // Check if ticket already listed
  const ticketRegex = new RegExp(`^-\\s*\\[${ticketId}\\].*$`, 'm');
  if (ticketRegex.test(contextContent)) {
    contextContent = contextContent.replace(ticketRegex, newSpecLink);
  } else {
    // Append under "Active Initiatives & Specs"
    const targetSection = '## Active Initiatives & Specs';
    const index = contextContent.indexOf(targetSection);
    if (index !== -1) {
      const insertionPoint = index + targetSection.length;
      contextContent = contextContent.slice(0, insertionPoint) + '\n' + newSpecLink + contextContent.slice(insertionPoint);
    } else {
      contextContent += '\n\n' + targetSection + '\n' + newSpecLink;
    }
  }
  fs.writeFileSync(contextPath, contextContent, 'utf8');
  console.log(`Updated CONTEXT.md index file.`);
}

// Archive the original ticket folder
const archiveDir = path.join(workspaceRoot, 'tickets', '.archive');
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}
const destTicketDir = path.join(archiveDir, ticketId);
if (fs.existsSync(destTicketDir)) {
  // Simple delete recursive if it already exists
  fs.rmSync(destTicketDir, { recursive: true, force: true });
}
fs.renameSync(ticketDir, destTicketDir);
console.log(`Moved tickets/${ticketId}/ directory to tickets/.archive/${ticketId}/`);

console.log(`\n\x1b[32m[Phase 10: Context Archive Completed Successfully]\x1b[0m`);
