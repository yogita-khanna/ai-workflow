---
trigger: "Initiate the DevFlow agent loop and route to the correct workflow skill."
---

# Skill: using-devflow

## AGENT DIRECTIVE: TOKEN & CONTEXT OPTIMIZATION (CRITICAL)
To minimize API token usage and prevent reading the entire project iteratively:
1. **Never use generic search commands** across the entire workspace (`ls -R`, `find .`, or viewing massive `package-lock.json` files).
2. **Restrict your context window**: When you are assigned a ticket, only view the specific directories and files relevant to that domain (e.g., if working on Auth, only read `src/modules/auth`).
3. **Rely on `CONTEXT.md` and `design.md`**: Do not re-explore the architecture. Read the root-level `CONTEXT.md` and the ticket's `design.md` to execute strictly against it.

## Overview
This skill acts as the entry point and orchestrator for the AI DevFlow plugin. It helps the agent orient itself in our pnpm workspace and execute the strict 10-phase spec-driven workflow.

## The 10-Phase End-to-End Workflow

```
Idea/Ticket
   │
   ▼
1. Discovery & Framing  ──────────────► [Planner/PM Agent]
   │
   ▼
2. Spec Writing  ─────────────────────► [Spec Agent]      ◄── ✅ HUMAN CHECKPOINT #1 (Spec Approval)
   │
   ▼
3. Technical Design / Architecture ───► [Architect Agent]  ◄── ✅ HUMAN CHECKPOINT #2 (Design Approval)
   │
   ▼
4. Task Breakdown  ────────────────────► [Planner Agent]
   │
   ▼
5. Implementation  ─────────────────────► [Coder Agent]
   │
   ▼
6. Self-Review & Tests  ────────────────► [Coder Agent + Test Agent]
   │
   ▼
7. Code Review  ─────────────────────────► [Reviewer Agent]  ◄── ✅ HUMAN CHECKPOINT #3 (Review Sign-off)
   │
   ▼
8. Documentation  ───────────────────────► [Docs Agent]
   │
   ▼
9. PR & CI  ──────────────────────────────► [Coder Agent]     ◄── ✅ HUMAN CHECKPOINT #4 (Merge Approval)
   │
   ▼
10. Merge & Context Archive  ─────────────► [Context Agent]
```

## Human Checkpoints (Hard Gates)
Every phase must respect these checkpoints. You MUST halt execution and request human action when hitting a checkpoint:
1. **Checkpoint #1 (Spec Approval):** Human signs off scope and acceptance criteria before design.
2. **Checkpoint #2 (Design Approval):** Senior engineer/architect signs off technical design/ADRs before implementation.
3. **Checkpoint #3 (Review Sign-off):** Human reviewer approves code review.
4. **Checkpoint #4 (Merge Approval):** Release owner merges PR.

## Step-by-Step Guidance
1. **Identify current phase of ticket**:
   - If starting a ticket -> load `classify-ticket` and `writing-a-spec` (Phases 1-4).
   - If design is approved -> load `using-worktrees` and `tdd-loop` (Phase 5-6).
   - If self-review is done -> load `reviewing-a-pr` (Phase 7).
   - If code review is approved -> load `documenting-changes` (Phase 8).
   - If documentation is updated -> load `finishing-a-branch` (Phase 9).
   - If branch is merged -> load `context-preservation` (Phase 10).
2. **Transition to the chosen skill**: Read the corresponding `SKILL.md` and execute its instructions.
