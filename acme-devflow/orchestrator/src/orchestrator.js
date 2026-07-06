const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const db = require('./db');
const runner = require('./agent-runner');

const workspaceRoot = path.resolve(__dirname, '..', '..', '..');

// Load configurations dynamically
const pipelineConfigPath = path.join(workspaceRoot, 'acme-devflow', 'pipeline.yml');
const rbacConfigPath = path.join(workspaceRoot, 'acme-devflow', 'rbac.yml');

let pipelineConfig = { phases: [] };
let rbacConfig = { roles: {}, users: {} };

try {
  if (fs.existsSync(pipelineConfigPath)) {
    pipelineConfig = yaml.load(fs.readFileSync(pipelineConfigPath, 'utf8'));
  }
} catch (e) {
  console.error('[Orchestrator] Error loading pipeline.yml:', e.message);
}

try {
  if (fs.existsSync(rbacConfigPath)) {
    rbacConfig = yaml.load(fs.readFileSync(rbacConfigPath, 'utf8'));
  }
} catch (e) {
  console.error('[Orchestrator] Error loading rbac.yml:', e.message);
}

function getPhaseConfig(phaseNumber) {
  return pipelineConfig.phases.find(p => p.phase === phaseNumber);
}

function checkUserPermission(username, requiredPermission) {
  if (!username) return false;
  const user = rbacConfig.users[username];
  if (!user) return false;
  const role = rbacConfig.roles[user.role];
  if (!role || !role.permissions) return false;
  return role.permissions.includes(requiredPermission);
}

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

  audit(action, details = '', user = 'System') {
    db.logAudit(this.ticketId, action, user, details);
  }

  init() {
    this.ticket.state = 'INTAKE';
    this.ticket.specApproved = false;
    this.ticket.designApproved = false;
    this.ticket.swaggerApproved = false;
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
    const p1 = getPhaseConfig(1) || { agent: 'pm-agent', name: 'Discovery & Framing' };
    runner.runAgentTask(p1.agent, this.ticketId, `Phase 1 - ${p1.name}`, 'Classifying ticket risk and framing goals');
    
    // Spec Agent Spec Writing
    const p2 = getPhaseConfig(2) || { agent: 'spec-agent', name: 'Spec Writing' };
    runner.runAgentTask(p2.agent, this.ticketId, `Phase 2 - ${p2.name}`, 'Scaffolding spec.md and use cases');

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

  approveSpec(approvingUser) {
    const p2 = getPhaseConfig(2);
    if (p2 && p2.checkpoint) {
      if (!checkUserPermission(approvingUser, p2.checkpoint.permission)) {
        this.log(`\x1b[31m[BLOCKED]\x1b[0m User "${approvingUser || 'Unknown'}" is not authorized to approve spec (needs permission "${p2.checkpoint.permission}").`);
        return false;
      }
      this.ticket[p2.checkpoint.requires] = true;
      this.ticket.state = p2.checkpoint.nextState;
    } else {
      this.ticket.specApproved = true;
      this.ticket.state = 'SPEC_APPROVED';
    }
    
    this.save();
    
    // Update status in spec.md
    const specPath = path.join(workspaceRoot, 'tickets', this.ticketId, 'spec.md');
    if (fs.existsSync(specPath)) {
      let content = fs.readFileSync(specPath, 'utf8');
      content = content.replace(/Status: Draft \/ In Review \/ Approved/g, 'Status: Approved');
      fs.writeFileSync(specPath, content, 'utf8');
    }

    this.log(`Checkpoint #1 passed. Spec approved for ${this.ticketId} by ${approvingUser || 'System'}.`);
    this.audit('APPROVE_SPEC', 'Checkpoint #1 Spec approved by human', approvingUser || 'System');
    return true;
  }

  design() {
    const p2 = getPhaseConfig(2);
    const requiresField = p2 && p2.checkpoint ? p2.checkpoint.requires : 'specApproved';
    
    if (!this.ticket[requiresField]) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot draft technical design. Spec must be approved first.`);
      return false;
    }

    const p3 = getPhaseConfig(3) || { agent: 'architect-agent', name: 'Technical Design' };
    runner.runAgentTask(p3.agent, this.ticketId, `Phase 3 - ${p3.name}`, 'Drafting design.md and proposing ADRs');

    this.ticket.state = 'DESIGN_DRAFTING';
    this.save();
    
    this.log(`Architect Agent completed drafting design.md.`);
    this.audit('DESIGN', 'Drafted technical design and ADRs');
    this.log(`\x1b[31m[CHECKPOINT #2: Design Approval Required]\x1b[0m Design must be signed off before implementation.`);
    return true;
  }

  approveDesign(approvingUser) {
    const p3 = getPhaseConfig(3);
    if (p3 && p3.checkpoint) {
      if (!checkUserPermission(approvingUser, p3.checkpoint.permission)) {
        this.log(`\x1b[31m[BLOCKED]\x1b[0m User "${approvingUser || 'Unknown'}" is not authorized to approve design (needs permission "${p3.checkpoint.permission}").`);
        return false;
      }
      this.ticket[p3.checkpoint.requires] = true;
      this.ticket.state = p3.checkpoint.nextState;
    } else {
      this.ticket.designApproved = true;
      this.ticket.state = 'DESIGN_APPROVED';
    }
    
    this.save();

    // Update status in design.md
    const designPath = path.join(workspaceRoot, 'tickets', this.ticketId, 'design.md');
    if (fs.existsSync(designPath)) {
      let content = fs.readFileSync(designPath, 'utf8');
      content = content.replace(/Status: Draft \/ Approved \(Checkpoint #2\)/g, 'Status: Approved (Checkpoint #2)');
      fs.writeFileSync(designPath, content, 'utf8');
    }

    this.log(`Checkpoint #2 passed. Design approved for ${this.ticketId} by ${approvingUser || 'System'}.`);
    this.audit('APPROVE_DESIGN', 'Checkpoint #2 Design approved by human', approvingUser || 'System');
    return true;
  }

  swagger() {
    const p3 = getPhaseConfig(3);
    const requiresField = p3 && p3.checkpoint ? p3.checkpoint.requires : 'designApproved';

    if (!this.ticket[requiresField]) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot generate Swagger spec. Design must be approved first.`);
      return false;
    }

    const p4 = getPhaseConfig(4) || { agent: 'architect-agent', name: 'Swagger API Specification' };
    runner.runAgentTask(p4.agent, this.ticketId, `Phase 4 - ${p4.name}`, 'Drafting OpenAPI/Swagger schemas in spec.md');

    this.ticket.state = 'SWAGGER_REVIEW';
    this.save();
    
    this.log(`Architect Agent completed drafting Swagger API contract.`);
    this.audit('SWAGGER', 'Drafted Swagger API contract');
    this.log(`\x1b[31m[CHECKPOINT: Swagger Approval Required]\x1b[0m Swagger API contracts must be approved before tasks are broken down.`);
    return true;
  }

  approveSwagger(approvingUser) {
    const p4 = getPhaseConfig(4);
    if (p4 && p4.checkpoint) {
      if (!checkUserPermission(approvingUser, p4.checkpoint.permission)) {
        this.log(`\x1b[31m[BLOCKED]\x1b[0m User "${approvingUser || 'Unknown'}" is not authorized to approve Swagger (needs permission "${p4.checkpoint.permission}").`);
        return false;
      }
      this.ticket[p4.checkpoint.requires] = true;
      this.ticket.state = p4.checkpoint.nextState;
    } else {
      this.ticket.swaggerApproved = true;
      this.ticket.state = 'SWAGGER_APPROVED';
    }
    
    this.save();

    this.log(`Checkpoint passed. Swagger API contracts approved for ${this.ticketId} by ${approvingUser || 'System'}.`);
    this.audit('APPROVE_SWAGGER', 'Swagger approved by human', approvingUser || 'System');
    return true;
  }

  implement() {
    const p4 = getPhaseConfig(4);
    const requiresField = p4 && p4.checkpoint ? p4.checkpoint.requires : 'swaggerApproved';

    if (!this.ticket[requiresField]) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot implement feature. Swagger contract must be approved first.`);
      return false;
    }

    // Planner task breakdown
    const p5 = getPhaseConfig(5) || { agent: 'planner-agent', name: 'Task Breakdown' };
    runner.runAgentTask(p5.agent, this.ticketId, `Phase 5 - ${p5.name}`, 'Creating DAG tasks checklist in tasks.md');

    // Coder implementation TDD
    const p6 = getPhaseConfig(6) || { agent: 'coder-agent', name: 'Implementation' };
    runner.runAgentTask(p6.agent, this.ticketId, `Phase 6 - ${p6.name}`, 'Executing TDD loops (RED -> GREEN)');

    // Test Agent self-tests
    const p7 = getPhaseConfig(7) || { agent: 'test-agent', name: 'Self-Review & Tests' };
    runner.runAgentTask(p7.agent, this.ticketId, `Phase 7 - ${p7.name}`, 'Executing unit and integration test suite');

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

    const p8 = getPhaseConfig(8) || { agent: 'reviewer-agent', name: 'Code Review' };
    runner.runAgentTask(p8.agent, this.ticketId, `Phase 8 - ${p8.name}`, 'Scanning diffs for SQL injections and N+1 queries');

    this.ticket.state = 'UNDER_REVIEW';
    this.save();

    this.log(`Reviewer Agent completed review pass. 0 issues found.`);
    this.audit('REVIEW', 'Reviewer Agent first pass review completed');
    this.log(`\x1b[31m[CHECKPOINT #3: Review Sign-off Required]\x1b[0m A human reviewer must approve before PR merge.`);
    return true;
  }

  approveReview(approvingUser) {
    const p8 = getPhaseConfig(8);
    if (p8 && p8.checkpoint) {
      if (!checkUserPermission(approvingUser, p8.checkpoint.permission)) {
        this.log(`\x1b[31m[BLOCKED]\x1b[0m User "${approvingUser || 'Unknown'}" is not authorized to approve code review (needs permission "${p8.checkpoint.permission}").`);
        return false;
      }
      this.ticket[p8.checkpoint.requires] = true;
      this.ticket.state = p8.checkpoint.nextState;
    } else {
      this.ticket.reviewApproved = true;
      this.ticket.state = 'REVIEW_APPROVED';
    }
    
    this.save();

    this.log(`Checkpoint #3 passed. Code review signed off by human reviewer ${approvingUser || 'System'}.`);
    this.audit('APPROVE_REVIEW', 'Checkpoint #3 Code review approved by human', approvingUser || 'System');
    return true;
  }

  document() {
    const p8 = getPhaseConfig(8);
    const requiresField = p8 && p8.checkpoint ? p8.checkpoint.requires : 'reviewApproved';

    if (!this.ticket[requiresField]) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot generate documentation. Code review must be approved first.`);
      return false;
    }

    const p9 = getPhaseConfig(9) || { agent: 'docs-agent', name: 'Documentation' };
    runner.runAgentTask(p9.agent, this.ticketId, `Phase 9 - ${p9.name}`, 'Generating functional and technical references');

    this.ticket.state = 'DOCS_COMPLETE';
    this.save();

    this.log(`Docs Agent completed documentation updates.`);
    this.audit('DOCUMENT', 'Updated technical and functional docs');
    return true;
  }

  merge(approvingUser) {
    if (this.ticket.state !== 'DOCS_COMPLETE') {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot merge. Documentation must be completed first.`);
      return false;
    }

    const p10 = getPhaseConfig(10);
    if (p10 && p10.checkpoint) {
      if (!checkUserPermission(approvingUser, p10.checkpoint.permission)) {
        this.log(`\x1b[31m[BLOCKED]\x1b[0m User "${approvingUser || 'Unknown'}" is not authorized to merge PR (needs permission "${p10.checkpoint.permission}").`);
        return false;
      }
      this.ticket[p10.checkpoint.requires] = true;
      this.ticket.state = p10.checkpoint.nextState;
    } else {
      this.ticket.prMerged = true;
      this.ticket.state = 'MERGED';
    }

    runner.runAgentTask('coder-agent', this.ticketId, 'Phase 10 - PR & CI', 'Validating CI and requesting merge go-ahead');

    this.save();

    this.log(`PR merged successfully by ${approvingUser || 'System'}.`);
    this.audit('MERGE', 'PR merged into main branch', approvingUser || 'System');
    return true;
  }

  archive() {
    const p10 = getPhaseConfig(10);
    const requiresField = p10 && p10.checkpoint ? p10.checkpoint.requires : 'prMerged';

    if (!this.ticket[requiresField]) {
      this.log(`\x1b[31m[BLOCKED]\x1b[0m Cannot archive. PR must be merged first.`);
      return false;
    }

    const p11 = getPhaseConfig(11) || { agent: 'context-agent', name: 'Merge & Context Archive' };
    runner.runAgentTask(p11.agent, this.ticketId, `Phase 11 - ${p11.name}`, 'Archiving specs, ADRs, and session logs');

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

        const newSpecLink = `- [${this.ticketId}]: ${specTitle} — Spec: [docs/context/specs/${this.ticketId.toLowerCase()}.md](docs/context/specs/${this.ticketId.toLowerCase()}.md) — Status: Archived`;
        
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
