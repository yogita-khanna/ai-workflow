const fs = require('fs');
const path = require('path');
const db = require('../src/db');
const Orchestrator = require('../src/orchestrator');

const ticketId = 'DEV-TEST-123';
const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
const ticketDir = path.join(workspaceRoot, 'tickets', ticketId);
const contextPath = path.join(workspaceRoot, 'CONTEXT.md');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    failedTests++;
    console.error(`\x1b[31m[FAIL]\x1b[0m ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${message}`);
  }
}

async function run() {
  console.log(`\n\x1b[36m====================================================\x1b[0m`);
  console.log(`\x1b[36mRunning E2E DevFlow Orchestrator State Machine Tests\x1b[0m`);
  console.log(`\x1b[36m====================================================\x1b[0m\n`);

  try {
    // Ensure clean state before starting
    if (fs.existsSync(ticketDir)) {
      fs.rmSync(ticketDir, { recursive: true, force: true });
    }
    const archiveTicketDir = path.join(workspaceRoot, 'tickets', '.archive', ticketId);
    if (fs.existsSync(archiveTicketDir)) {
      fs.rmSync(archiveTicketDir, { recursive: true, force: true });
    }
    const preservedSpec = path.join(workspaceRoot, 'docs', 'context', 'specs', `${ticketId.toLowerCase()}.md`);
    if (fs.existsSync(preservedSpec)) {
      fs.rmSync(preservedSpec, { force: true });
    }
    const preservedDesign = path.join(workspaceRoot, 'docs', 'context', 'specs', `${ticketId.toLowerCase()}-design.md`);
    if (fs.existsSync(preservedDesign)) {
      fs.rmSync(preservedDesign, { force: true });
    }
    if (fs.existsSync(contextPath)) {
      fs.rmSync(contextPath, { force: true });
    }

    const orch = new Orchestrator(ticketId);

    // 1. Init Phase (Intake Queue)
    orch.init();
    assert(orch.ticket.state === 'INTAKE', 'Ticket status should be INTAKE');

    // 2. Propose Phase (PM/Spec Agent & Classification)
    orch.propose();
    assert(orch.ticket.state === 'SPEC_WRITING', 'Ticket status should be SPEC_WRITING');
    assert(fs.existsSync(path.join(ticketDir, 'spec.md')), 'spec.md template should be scaffolded');
    assert(fs.existsSync(path.join(ticketDir, 'design.md')), 'design.md template should be scaffolded');
    assert(fs.existsSync(path.join(ticketDir, 'tasks.md')), 'tasks.md template should be scaffolded');

    // 3. Blockage Check - Cannot design before spec approval
    console.log('\nTesting Gate: Cannot design before spec approval (Checkpoint #1)...');
    const designResult = orch.design();
    assert(designResult === false, 'orch.design() should fail when spec is not approved');
    assert(orch.ticket.state === 'SPEC_WRITING', 'State should remain SPEC_WRITING');

    // 4. Approve Spec (Checkpoint #1)
    orch.approveSpec();
    assert(orch.ticket.specApproved === true, 'specApproved should be true');
    assert(orch.ticket.state === 'SPEC_APPROVED', 'State should transition to SPEC_APPROVED');
    const specContent = fs.readFileSync(path.join(ticketDir, 'spec.md'), 'utf8');
    assert(specContent.includes('Status: Approved'), 'spec.md status should be updated to Approved');

    // 5. Technical Design drafting (Architect Agent)
    const designResult2 = orch.design();
    assert(designResult2 === true, 'orch.design() should succeed when spec is approved');
    assert(orch.ticket.state === 'DESIGN_DRAFTING', 'State should transition to DESIGN_DRAFTING');

    // 6. Blockage Check - Cannot implement before design approval
    console.log('\nTesting Gate: Cannot implement before design approval (Checkpoint #2)...');
    const implementResult = orch.implement();
    assert(implementResult === false, 'orch.implement() should fail when design is not approved');
    assert(orch.ticket.state === 'DESIGN_DRAFTING', 'State should remain DESIGN_DRAFTING');

    // 7. Approve Design (Checkpoint #2)
    orch.approveDesign();
    assert(orch.ticket.designApproved === true, 'designApproved should be true');
    assert(orch.ticket.state === 'DESIGN_APPROVED', 'State should transition to DESIGN_APPROVED');
    const designContent = fs.readFileSync(path.join(ticketDir, 'design.md'), 'utf8');
    assert(designContent.includes('Status: Approved (Checkpoint #2)'), 'design.md status should be updated to Approved');

    // 8. Implement Phase (TDD Loop & Tests)
    const implementResult2 = orch.implement();
    assert(implementResult2 === true, 'orch.implement() should succeed when design is approved');
    assert(orch.ticket.state === 'IMPLEMENTED', 'State should transition to IMPLEMENTED');

    // 9. Review Phase (Reviewer Agent checklist scan)
    const reviewResult = orch.review();
    assert(reviewResult === true, 'orch.review() should succeed');
    assert(orch.ticket.state === 'UNDER_REVIEW', 'State should transition to UNDER_REVIEW');

    // 10. Blockage Check - Cannot document before review approval
    console.log('\nTesting Gate: Cannot document before review approval (Checkpoint #3)...');
    const docResult = orch.document();
    assert(docResult === false, 'orch.document() should fail when review is not approved');
    assert(orch.ticket.state === 'UNDER_REVIEW', 'State should remain UNDER_REVIEW');

    // 11. Approve Review (Checkpoint #3)
    orch.approveReview();
    assert(orch.ticket.reviewApproved === true, 'reviewApproved should be true');
    assert(orch.ticket.state === 'REVIEW_APPROVED', 'State should transition to REVIEW_APPROVED');

    // 12. Document Phase (Docs Agent outputs)
    const docResult2 = orch.document();
    assert(docResult2 === true, 'orch.document() should succeed when review is approved');
    assert(orch.ticket.state === 'DOCS_COMPLETE', 'State should transition to DOCS_COMPLETE');

    // 13. Blockage Check - Cannot archive before PR is merged
    console.log('\nTesting Gate: Cannot archive before merge (Checkpoint #4)...');
    const archiveResult = orch.archive();
    assert(archiveResult === false, 'orch.archive() should fail when PR is not merged');
    assert(orch.ticket.state === 'DOCS_COMPLETE', 'State should remain DOCS_COMPLETE');

    // 14. Merge Phase (Checkpoint #4 Approval)
    const mergeResult = orch.merge();
    assert(mergeResult === true, 'orch.merge() should succeed when docs are complete');
    assert(orch.ticket.prMerged === true, 'prMerged should be true');
    assert(orch.ticket.state === 'MERGED', 'State should transition to MERGED');

    // 15. Context Archive (Phase 10 Preservation)
    const archiveResult2 = orch.archive();
    assert(archiveResult2 === true, 'orch.archive() should succeed when PR is merged');
    assert(orch.ticket.state === 'ARCHIVED', 'State should transition to ARCHIVED');

    // Verify archives exist and original folder moved
    assert(!fs.existsSync(ticketDir), 'Original ticket directory should be removed');
    assert(fs.existsSync(preservedSpec), 'Spec should be moved to docs/context/specs/');
    assert(fs.existsSync(preservedDesign), 'Design should be moved to docs/context/specs/');
    assert(fs.existsSync(path.join(workspaceRoot, 'tickets', '.archive', ticketId)), 'Ticket folder should reside in archive');

    // Verify CONTEXT.md updated
    assert(fs.existsSync(contextPath), 'CONTEXT.md should be created');
    const contextContent = fs.readFileSync(contextPath, 'utf8');
    assert(contextContent.includes(ticketId), 'CONTEXT.md should include ticket status');

    console.log(`\n\x1b[32m====================================================\x1b[0m`);
    console.log(`\x1b[32mAll Tests Passed! (${passedTests} passed, ${failedTests} failed)\x1b[0m`);
    console.log(`\x1b[32m====================================================\x1b[0m\n`);

  } catch (e) {
    console.error(`\n\x1b[31m====================================================\x1b[0m`);
    console.error(`\x1b[31mTests Failed! Catch Block: ${e.message}\x1b[0m`);
    console.error(`\x1b[31m====================================================\x1b[0m\n`);
    process.exit(1);
  } finally {
    // Teardown test artifacts
    if (fs.existsSync(ticketDir)) {
      fs.rmSync(ticketDir, { recursive: true, force: true });
    }
    const archiveTicketDir = path.join(workspaceRoot, 'tickets', '.archive', ticketId);
    if (fs.existsSync(archiveTicketDir)) {
      fs.rmSync(archiveTicketDir, { recursive: true, force: true });
    }
    const preservedSpec = path.join(workspaceRoot, 'docs', 'context', 'specs', `${ticketId.toLowerCase()}.md`);
    if (fs.existsSync(preservedSpec)) {
      fs.rmSync(preservedSpec, { force: true });
    }
    const preservedDesign = path.join(workspaceRoot, 'docs', 'context', 'specs', `${ticketId.toLowerCase()}-design.md`);
    if (fs.existsSync(preservedDesign)) {
      fs.rmSync(preservedDesign, { force: true });
    }
    if (fs.existsSync(contextPath)) {
      fs.rmSync(contextPath, { force: true });
    }
    
    // Clean database.json entry if possible
    const dbPath = path.resolve(__dirname, '..', 'database.json');
    if (fs.existsSync(dbPath)) {
      try {
        const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        delete dbData.tickets[ticketId];
        dbData.auditLogs = dbData.auditLogs.filter(log => log.ticketId !== ticketId);
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
      } catch (err) {}
    }
  }
}

run();
