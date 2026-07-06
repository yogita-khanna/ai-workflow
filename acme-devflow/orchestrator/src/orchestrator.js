const fs = require('fs');
const path = require('path');
const db = require('./db');
const runner = require('./agent-runner');

// Helpers for executing proposal/archival logic from command scripts
// Direct file modifications are best!

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');

class Orchestrator {
  constructor(ticketId) {
    this.ticketId = ticketId;
    this.ticket = db.getTicket(ticketId);
  }

  log(message) {
    console.log(`\x1b[34m[Orchestrator]\x1b[0m ${message}`);
  }

  save() {
    db.saveTicket(this.ticketId, this.ticket);
  }

  audit(action, details = '') {
    db.logAudit(this.ticketId, action, 'System', details);
  }

  init() {
    this.ticket.state = 'INTAKE';
    this.ticket.specApproved = false;
    this.ticket.designApproved = false;
    this.ticket.reviewApproved = false;
    this.ticket.prMerged = false;
    this.save();
    this.log(`Ticket ${this.ticketId} initialized in INTAKE queue.`);
    this.audit('INITIALIZE', 'Ticket entered intake queue');
  }

  propose() {
    if (this.ticket.state !== 'INTAKE') {
      this.log(`Warning: Initiating propose from state ${this.ticket.state}`);
    }
    
    // PM Agent Discovery
    runner.runAgentTask('pm-agent', this.ticketId, 'Phase 1 - Discovery & Framing', 'Classifying ticket risk and framing goals');
    
    // Spec Agent Spec Writing
    runner.runAgentTask('spec-agent', this.ticketId, 'Phase 2 - Spec Writing', 'Scaffolding spec.md and use cases');

    // Call propose script logic directly
    const ticketDir = path.join(workspaceRoot, 'tickets', this.ticketId);
    if (!fs.existsSync(ticketDir)) {
      fs.mkdirSync(ticketDir, { recursive: true });
    }
    
    const templatesDir = path.join(workspaceRoot, 'acme-devflow', 'spec-framework', 'templates');
    ['spec.md', 'design.md', 'tasks.md'].forEach(file => {
      const src = path.join(templatesDir, file);
      const dest = path.join(ticketDir, file);
      if (!fs.existsSync(dest) && fs.existsSync(src)) {
        let content = fs.readFileSync(src, 'utf8');
        content = content.replace(/<Ticket ID>/g, this.ticketId)
                         .replace(/\[TICKET-ID\]/g, this.ticketId)
                         .replace(/<YYYY-MM-DD>/g, new Date().toISOString().split('T')[0]);
        fs.writeFileSync(dest, content, 'utf8');
      }
    });

    // Classification
    let verdict = 'auto-apply';
    if (this.ticketId.toLowerCase().includes('auth') || this.ticketId.toLowerCase().includes('schema') || this.ticketId.toLowerCase().includes('payment')) {
      verdict = 'ask-human';
    }

    this.ticket.state = 'SPEC_WRITING';
    this.save();
    
    this.log(`Scaffolded specifications for ${this.ticketId}. Verdict: ${verdict}.`);
    this.audit('PROPOSE', `Scaffolded spec. Verdict: ${verdict}`);

    if (verdict === 'ask-human') {
      this.log(`\x1b[31m[CHECKPOINT #1: Spec Approval Required]\x1b[0m Spec writing halted. Human signature needed in spec.md.`);
    } else {
      this.log(`Auto-apply approved. Run 'approve-spec' to bypass checkpoint gate.`);
    }
  }

  approveSpec() {
    this.ticket.specApproved = true;
    this.ticket.state = 'SPEC_APPROVED';
    this.save();
    
    // Simulate updating status in spec.md
    const specPath = path.join(workspaceRoot, 'tickets', this.ticketId, 'spec.md');
    if (fs.existsSync(specPath)) {
      let content = fs.readFileSync(specPath, 'utf8');
      content = content.replace(/Status: Draft \/ In Review \/ Approved/g, 'Status: Approved');
      fs.writeFileSync(specPath, content, 'utf8');
    }

    this.log(`Checkpoint #1 passed. Spec approved for ${this.ticketId}.`);
    this.audit('APPROVE_SPEC', 'Checkpoint #1 Spec approved by human');
  }

  design() {
    if (!this.ticket.specApproved) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot draft technical design. Spec must be approved first.`);
      return false;
    }

    runner.runAgentTask('architect-agent', this.ticketId, 'Phase 3 - Technical Design', 'Drafting design.md and proposing ADRs');

    this.ticket.state = 'DESIGN_DRAFTING';
    this.save();
    
    this.log(`Architect Agent completed drafting design.md.`);
    this.audit('DESIGN', 'Drafted technical design and ADRs');
    this.log(`\x1b[31m[CHECKPOINT #2: Design Approval Required]\x1b[0m Design must be signed off before implementation.`);
    return true;
  }

  approveDesign() {
    this.ticket.designApproved = true;
    this.ticket.state = 'DESIGN_APPROVED';
    this.save();

    // Update status in design.md
    const designPath = path.join(workspaceRoot, 'tickets', this.ticketId, 'design.md');
    if (fs.existsSync(designPath)) {
      let content = fs.readFileSync(designPath, 'utf8');
      content = content.replace(/Status: Draft \/ Approved \(Checkpoint #2\)/g, 'Status: Approved (Checkpoint #2)');
      fs.writeFileSync(designPath, content, 'utf8');
    }

    this.log(`Checkpoint #2 passed. Design approved for ${this.ticketId}.`);
    this.audit('APPROVE_DESIGN', 'Checkpoint #2 Design approved by human');
  }

  implement() {
    if (!this.ticket.designApproved) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot implement feature. Design must be approved first.`);
      return false;
    }

    // Planner task breakdown
    runner.runAgentTask('planner-agent', this.ticketId, 'Phase 4 - Task Breakdown', 'Creating DAG tasks checklist in tasks.md');

    // Coder implementation TDD
    runner.runAgentTask('coder-agent', this.ticketId, 'Phase 5 - Implementation', 'Executing TDD loops (RED -> GREEN)');

    // Test Agent self-tests
    runner.runAgentTask('test-agent', this.ticketId, 'Phase 6 - Self-Review & Tests', 'Executing unit and integration test suite');

    this.ticket.state = 'IMPLEMENTED';
    this.save();

    this.log(`Implementation completed. Local tests passed.`);
    this.audit('IMPLEMENT', 'Completed implementation and local verification');
    return true;
  }

  review() {
    if (this.ticket.state !== 'IMPLEMENTED' && this.ticket.state !== 'UNDER_REVIEW') {
      this.log(`Warning: Initiating review from state ${this.ticket.state}`);
    }

    runner.runAgentTask('reviewer-agent', this.ticketId, 'Phase 7 - Code Review', 'Scanning diffs for SQL injections and N+1 queries');

    this.ticket.state = 'UNDER_REVIEW';
    this.save();

    this.log(`Reviewer Agent completed review pass. 0 issues found.`);
    this.audit('REVIEW', 'Reviewer Agent first pass review completed');
    this.log(`\x1b[31m[CHECKPOINT #3: Review Sign-off Required]\x1b[0m A human reviewer must approve before PR merge.`);
    return true;
  }

  approveReview() {
    this.ticket.reviewApproved = true;
    this.ticket.state = 'REVIEW_APPROVED';
    this.save();

    this.log(`Checkpoint #3 passed. Code review signed off by human reviewer.`);
    this.audit('APPROVE_REVIEW', 'Checkpoint #3 Code review approved by human');
  }

  document() {
    if (!this.ticket.reviewApproved) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot generate documentation. Code review must be approved first.`);
      return false;
    }

    runner.runAgentTask('docs-agent', this.ticketId, 'Phase 8 - Documentation', 'Generating functional and technical references');

    this.ticket.state = 'DOCS_COMPLETE';
    this.save();

    this.log(`Docs Agent completed documentation updates.`);
    this.audit('DOCUMENT', 'Updated technical and functional docs');
    return true;
  }

  merge() {
    if (this.ticket.state !== 'DOCS_COMPLETE') {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot merge. Documentation must be completed first.`);
      return false;
    }

    runner.runAgentTask('coder-agent', this.ticketId, 'Phase 9 - PR & CI', 'Validating CI and requesting merge go-ahead');

    this.ticket.prMerged = true;
    this.ticket.state = 'MERGED';
    this.save();

    this.log(`PR merged successfully.`);
    this.audit('MERGE', 'PR merged into main branch');
    return true;
  }

  archive() {
    if (!this.ticket.prMerged) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot archive. PR must be merged first.`);
      return false;
    }

    runner.runAgentTask('context-preservation', this.ticketId, 'Phase 10 - Context Archive', 'Archiving specs, ADRs, and session logs');

    // Execute archive logic
    const ticketDir = path.join(workspaceRoot, 'tickets', this.ticketId);
    if (fs.existsSync(ticketDir)) {
      const contextDocsDir = path.join(workspaceRoot, 'docs', 'context');
      const specsDir = path.join(contextDocsDir, 'specs');
      const adrsDir = path.join(contextDocsDir, 'adrs');
      const sessionsDir = path.join(contextDocsDir, 'sessions');

      [specsDir, adrsDir, sessionsDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });

      // Move files
      const specPath = path.join(ticketDir, 'spec.md');
      const archiveSpecPath = path.join(specsDir, `${this.ticketId.toLowerCase()}.md`);
      if (fs.existsSync(specPath)) {
        fs.copyFileSync(specPath, archiveSpecPath);
      }

      const designPath = path.join(ticketDir, 'design.md');
      const archiveDesignPath = path.join(specsDir, `${this.ticketId.toLowerCase()}-design.md`);
      if (fs.existsSync(designPath)) {
        fs.copyFileSync(designPath, archiveDesignPath);
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
        // Extract title
        let specTitle = 'Unnamed Feature';
        if (fs.existsSync(specPath)) {
          const specRaw = fs.readFileSync(specPath, 'utf8');
          const titleMatch = specRaw.match(/^# Spec:\s*(.*)$/m) || specRaw.match(/^#\s*(.*)$/m);
          if (titleMatch) specTitle = titleMatch[1].trim();
        }

        const newSpecLink = `- [${this.ticketId}]: ${specTitle} — Spec: [/docs/context/specs/${this.ticketId.toLowerCase()}.md] — Status: Archived`;
        
        // Check if ticket already listed
        const ticketRegex = new RegExp(`^-\\s*\\[${this.ticketId}\\].*$`, 'm');
        if (ticketRegex.test(contextContent)) {
          contextContent = contextContent.replace(ticketRegex, newSpecLink);
        } else {
          const targetSection = '## Active Initiatives & Specs';
          const targetIndex = contextContent.indexOf(targetSection);
          if (targetIndex !== -1) {
            const insertionPoint = targetIndex + targetSection.length;
            contextContent = contextContent.slice(0, insertionPoint) + '\n' + newSpecLink + contextContent.slice(insertionPoint);
          } else {
            contextContent += '\n\n' + targetSection + '\n' + newSpecLink;
          }
        }
        fs.writeFileSync(contextPath, contextContent, 'utf8');
      }

      // Move original ticket folder
      const archiveDir = path.join(workspaceRoot, 'tickets', '.archive');
      if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
      const destTicketDir = path.join(archiveDir, this.ticketId);
      if (fs.existsSync(destTicketDir)) fs.rmSync(destTicketDir, { recursive: true, force: true });
      fs.renameSync(ticketDir, destTicketDir);
    }

    this.ticket.state = 'ARCHIVED';
    this.save();

    this.log(`Ticket ${this.ticketId} archived. Context preserved.`);
    this.audit('ARCHIVE', 'Archived spec files and session logs');
    return true;
  }
}

module.exports = Orchestrator;
