# `acme-devflow` Architecture

\`acme-devflow\` is a native, open-source-style dev pipeline plugin modeled after the Superpowers / OpenSpec paradigm. It enforces a strict, agent-driven workflow from intake through to the \`dev\` environment, explicitly stopping before production.

## System Components

### 1. The Skills Library (\`skills/\`)
A collection of composable capabilities. Agents load these skills dynamically during a session.
- **Bootstrapping:** \`using-devflow\` runs first, enforcing that the agent uses the pipeline rather than cowboy-coding.
- **Action Skills:** Handle specific tasks like classification, spec writing, TDD execution, PR reviewing, and worktree manipulation.

### 2. Spec-Driven Framework (\`spec-framework/\`)
Agent-invocable commands that produce stateful artifacts (specs).
- **Commands:** \`/devflow:propose\`, \`/devflow:apply\`, \`/devflow:archive\`, \`/devflow:explore\`.
- **Templates:** Markdown artifacts representing the current requirements in a delta format (Given/When/Then).

### 3. The Orchestrator (\`orchestrator/\`)
The Node.js state machine that ties the skills and spec framework together.

## State Machine Stages

The orchestrator guarantees the following linear pipeline. No stage can be bypassed (except manually selected bugs, which skip classification).

1. **Intake Queue:** Features (from GitHub Projects) and Complex Bugs (from Jira) enter here.
2. **Classification:** Automated agent check using the \`classify-ticket\` skill. Outputs \`auto-resolve\` or \`ask-human\`.
3. **Spec Frozen:** The ticket enters the implementation queue with explicit requirements.
4. **Worktree Creation:** A local \`git worktree\` (\`agent/<ticket-id>-<slug>\`) is allocated.
5. **Implement + TDD Loop:** Agent loops through test/code cycles. Escalates to human on max-retry limit.
6. **Standards + Regression Check:** Runs linting, type-checking, and the full backend test suite against the diff.
7. **Frontend Self-Test:** (If applicable) Deploys a preview CDN build and runs UI flow tests.
8. **Create PR:** Agent opens the PR but **never self-merges**.
9. **Reviewer Comments:** The agent addresses comments from humans or review-bots in a loop until resolved.
10. **Human Approves & Merges:** A required platform-level human action merges the PR to \`dev\`.
11. **Dev Integration & Regression:** Final integration test on the \`dev\` branch.
12. **Terminal State ("Deployed to Dev"):** The ticket is closed, and the worktree is cleaned up.

> [!WARNING]
> **Production Boundary:** There is **NO** automated path to production. Humans decide when/how to promote \`dev\` -> \`main\`/prod separately.

## Integration Details

- **Ticketing:** Features live in GitHub Projects. Bugs live in Jira (fetched read-only via \`jira-client.ts\`).
- **State Persistence:** SQLite tracks ticket status and audit logs (single-instance setup).
- **Notifications:** Slack for urgent alerts (escalations, classification tradeoffs) and GitHub PR comments for code review.

## Concurrency Safety

\`acme-devflow\` is designed to run multiple agents concurrently safely:
1. **File Isolation:** Each ticket gets its own isolated \`git worktree\` directory.
2. **Branch Isolation:** Each ticket pushes to a uniquely named remote branch (\`agent/<id>-<slug>\`), preventing push races.
3. **Port Isolation:** Frontend preview servers are assigned deterministic, isolated ports based on a hash of the ticket ID to prevent bind conflicts.
