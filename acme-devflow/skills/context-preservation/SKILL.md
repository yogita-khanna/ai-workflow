---
trigger: "Archive and preserve session history, decisions (ADRs), specs, and update the repository CONTEXT.md."
---

# Skill: context-preservation

## Overview

Context preservation runs continuously across all phases, culminating in Phase 10 (Merge & Context Archive) to prevent knowledge loss between sessions, agents, and human developers.

## Guidelines & Deliverables

### 1. What Gets Preserved

- **Decisions, not just outcomes:** Every ADR records what was decided, why, and what alternatives were rejected and why.
- **Spec-to-code traceability:** Each acceptance criterion links to the commit(s)/test(s) that satisfy it.
- **Review rationale:** Code review comments (especially blocking ones) and their resolutions are archived, not deleted, once the PR merges.
- **Session summaries:** At the end of each agent working session, write a structured summary (`session_summary.md`) detailing: what was attempted, what worked, what didn't, and next steps/open questions.

### 2. In-Repo Context Store Directory Structure

All records are saved in the repository under `docs/context/` (version-controlled alongside code):

- **Specs:** `docs/context/specs/<feature>.md` (approved spec and design).
- **ADRs:** `docs/context/adrs/NNN-<title>.md` (architectural decision records).
- **Session logs:** `docs/context/sessions/<date>-<feature>.md` (agent working session summaries).

### 3. Living `CONTEXT.md` at Repo Root

- Maintain a short, continuously-updated index at the repository root (`CONTEXT.md`).
- Must contain: current architecture overview, active initiatives, known constraints/gotchas, and links into the context folder.
- Keep it under ~1 page.

### 4. Phase 10 Execution Steps (Context Agent)

1. **Move specs & designs** from temporary `tickets/` folders to `/docs/context/specs/`.
2. **Move ADRs** to `/docs/context/adrs/`.
3. **Move session summaries** to `/docs/context/sessions/`.
4. **Update `CONTEXT.md`:** Remove the ticket from active initiatives, mark it as archived, and update the index of context records.
5. **Run Clean-up:** Teardown any local branch worktrees.
