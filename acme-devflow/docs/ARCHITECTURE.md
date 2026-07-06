# `acme-devflow` Architecture & Workflow

`acme-devflow` is a native, open-source-style dev pipeline plugin designed for pairing human engineers with AI agents. It enforces a strict, agent-driven workflow from discovery and spec-writing to the code review and merge stage, using hard human gates before key milestones.

---

## 0. Workflow at a Glance

```
Idea/Ticket
   │
   ▼
1. Discovery & Framing  ──────────────► [Planner/PM Agent] using product-brainstorming
   │
   ▼
2. Spec Writing  ─────────────────────► [Spec Agent]      ◄── ✅ HUMAN CHECKPOINT #1 (Spec Approval)
   │
   ▼
3. Technical Design / Architecture ───► [Architect Agent]  ◄── ✅ HUMAN CHECKPOINT #2 (Design Approval)
   │
   ▼
4. Task Breakdown  ────────────────────► [Planner Agent] using sprint-planning
   │
   ▼
5. Implementation  ─────────────────────► [Coder Agent] (RED -> GREEN TDD loop)
   │
   ▼
6. Self-Review & Tests  ────────────────► [Coder Agent + Test Agent]
   │
   ▼
7. Code Review  ─────────────────────────► [Reviewer Agent]  ◄── ✅ HUMAN CHECKPOINT #3 (Review Sign-off)
   │
   ▼
8. Documentation  ───────────────────────► [Docs Agent] (Functional + Technical)
   │
   ▼
9. PR & CI  ──────────────────────────────► [Coder Agent]     ◄── ✅ HUMAN CHECKPOINT #4 (Merge Approval)
   │
   ▼
10. Merge & Context Archive  ─────────────► [Context Agent] (Archived under /docs/context/)
```

---

## 1. Phase-by-Phase Breakdown

### Phase 1 — Discovery & Framing

- **Goal:** Turn a raw idea/ticket into a clear problem statement.
- **Agent/Skill:** Planner or PM-style agent using `product-brainstorming` and `classify-ticket`.
- **Output:** Problem statement, goals/non-goals, rough scope, risk score.
- **Checkpoint:** None yet (low-cost exploration) — but flag if the idea is ambiguous enough to need a human decision.

### Phase 2 — Spec Writing

- **Agent/Skill:** Spec Agent (using `spec.md` template).
- **Output:** A committed `spec.md` in the ticket/repo directory.
- **✅ HUMAN CHECKPOINT #1 — Spec Approval:** A human (PM/Tech Lead) must approve scope, acceptance criteria, and non-goals in `spec.md` before any design work starts.

### Phase 3 — Technical Design / Architecture

- **Agent/Skill:** Architect Agent — proposes system design, data model, API contracts, and identifies risks/trade-offs. Produces an Architecture Decision Record (ADR) for any non-trivial decision.
- **Output:** Design doc (`design.md`) + ADRs.
- **✅ HUMAN CHECKPOINT #2 — Design Approval:** Senior engineer/architect reviews for feasibility, security, scalability, and consistency with existing systems before code implementation begins.

### Phase 4 — Task Breakdown

- **Agent/Skill:** Planner Agent (using `tasks.md` template) — breaks the approved design into atomic, independently reviewable tasks/tickets with estimates and dependencies in a Directed Acyclic Graph (DAG) checklist.
- **Output:** Task list checklist, each task linked back to the spec's acceptance criteria.

### Phase 5 — Implementation

- **Agent/Skill:** Coder Agent implements one task at a time, following the design doc and repo conventions.
- **Practice:** Small, focused commits; agent writes/updates tests alongside code (TDD loop: RED -> GREEN), not after.

### Phase 6 — Self-Review & Tests

- **Agent/Skill:** Coder Agent + Test Agent run unit/integration tests, linting, type checks; Coder Agent performs a self-diff review against the spec's acceptance criteria before requesting human/reviewer attention.
- **Output:** Green CI locally, a self-review note ("what changed and why") and session summary.

### Phase 7 — Code Review

- **Agent/Skill:** Reviewer Agent does a first pass against parameters (Correctness, Design, Tests, Security, Performance, Readability, Documentation), flags issues, and produces a review summary using severity prefixes (🔴 Blocking, 🟡 Should-fix, 🟢 Nit).
- **✅ HUMAN CHECKPOINT #3 — Review Sign-off:** A human reviewer (independent of the developer/agent) gives final approval. AI review reduces human review time but does not replace human sign-off.

### Phase 8 — Documentation

- **Agent/Skill:** Docs Agent — produces both functional and technical docs (API reference, data model changes, ADRs, runbooks).
- **Output:** Updated user-facing docs, technical references, changelog entries.

### Phase 9 — PR & CI

- **Agent/Skill:** Coder Agent opens the PR with a description generated from the spec + self-review; CI runs full test suite.
- **✅ HUMAN CHECKPOINT #4 — Merge Approval:** Release owner/tech lead merges the PR. Merge is a production commitment, which deserves its own explicit "go."

### Phase 10 — Merge & Context Archive

- **Agent/Skill:** Context Agent archives the spec, ADRs, review notes, and outcome into the context store (`docs/context/`) and updates the living `CONTEXT.md` index file so future work can retrieve why decisions were made.

---

## 2. Human Checkpoint Summary Table

| #   | Checkpoint          | Gate                                 | Who                    | Blocks             |
| --- | ------------------- | ------------------------------------ | ---------------------- | ------------------ |
| 1   | **Spec Approval**   | Scope/acceptance criteria signed off | PM / Tech Lead         | Design phase       |
| 2   | **Design Approval** | Architecture/ADRs signed off         | Senior Eng / Architect | Implementation     |
| 3   | **Review Sign-off** | Code review approved                 | Independent Reviewer   | PR merge readiness |
| 4   | **Merge Approval**  | Final go-ahead to merge              | Branch/Release Owner   | Actual merge       |

---

## 3. Context Preservation Mechanism

To prevent knowledge loss between sessions, agents, and humans:

- **`docs/context/specs/`**: Approved specs and designs.
- **`docs/context/adrs/`**: Architecture Decision Records detailing what was decided, why, and what was rejected.
- **`docs/context/sessions/`**: Agent session summaries detailing what was attempted, what worked, what didn't, and open questions.
- **`CONTEXT.md` at root:** Living, single-page index summarizing active initiatives, current architecture overview, and known constraints/gotchas.
