---
trigger: "Score a ticket's risk, reversibility, and precedent to determine if human approval is needed."
---

# Skill: classify-ticket

## Overview

Every new ticket must be classified during Phase 1 (Discovery & Framing). We use three criteria to determine if a ticket can be automatically implemented (`auto-apply`) or requires human approval (`ask-human`).

## Step-by-Step Guidance

1. **Evaluate Risk (Security & Data):** Does this touch authentication, payments, encryption, or the core user data model? (High Risk = `ask-human`). Is it a UI copy change or non-critical improvement? (Low Risk).
2. **Evaluate Reversibility (Schema & Rollback):** Does it involve schema migrations with data? Is it easy to rollback? (Low Reversibility = `ask-human`). Is it hidden behind a feature flag or easily revertible in a single PR? (High Reversibility).
3. **Evaluate Precedent (Existing Patterns):** Has the codebase implemented something structurally similar before? (No = `ask-human`, Yes = `auto-apply`).
4. **Determine Final Score:** If ANY of the three criteria are flagged as `ask-human` or equivalent, the overall score is `ask-human`.

## Ticket Classification Matrix

| Metric            | High Risk / Low Reversibility                                         | Low Risk / High Reversibility                                                              |
| ----------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Risk**          | Security, payments, user-delete, core schema changes (`ask-human`)    | Minor copy changes, style adjustments, isolated utilities (`auto-apply`)                   |
| **Reversibility** | SQL schema migrations affecting live tables (`ask-human`)             | Reversible client-side changes, new flags (`auto-apply`)                                   |
| **Precedent**     | First-time features, new libraries or core integrations (`ask-human`) | Matching established structure (e.g. adding an endpoint following patterns) (`auto-apply`) |

## Verification & Scoring

Fill in Section 6 of `spec.md` with this classification.
If the Verdict is `ask-human`, this blocks Phase 3 (Technical Design) and requires **Checkpoint #1 (Spec Approval)** signature.
If the Verdict is `auto-apply`, the agent can proceed autonomously, but must still complete design and tasks checklist files.
