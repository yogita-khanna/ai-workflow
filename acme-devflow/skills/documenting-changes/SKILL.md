---
trigger: "Produce functional and technical documentation for changes made."
---

# Skill: documenting-changes

## Overview

Documentation is run in Phase 8, but drafting should start as early as the spec (functional docs) and design doc (technical docs) so nothing is written from scratch.

## Guidelines & Deliverables

### 1. Functional Documentation (End Users & Stakeholders)

- **Owner:** Docs Agent (seeded from Spec's "User Stories" and "Acceptance Criteria").
- **Contents:** What the feature does, how to use it, examples/screenshots, and known limitations.
- **Trigger to update:** Any change to user-visible behavior.
- **Location:** User-facing docs / release notes.
- **Review:** Folded into Checkpoint #3 (reviewer confirms docs match actual shipped behavior).

### 2. Technical Documentation (Engineers)

- **Owner:** Docs Agent (seeded from Architecture docs/ADRs and code comments).
- **Contents:** API reference, data model/schema changes, architecture diagrams, ADRs, runbooks (deploy/rollback steps), configuration flags.
- **Trigger to update:** Any change to public interfaces, schemas, or operational behavior.
- **Location:** Repo `/docs` or internal wiki (version-controlled alongside code).
- **Review:** Folded into Checkpoint #3.

### 3. Documentation Principles

- **No Follow-ups:** Docs must be generated as part of the PR, not as a follow-up ticket. Stale or missing docs are blocking issues for Code Review.
- **Dry/Link-First:** One canonical source per fact. Link, don't duplicate, between functional and technical docs.
- **ADR Referencing:** Every ADR that changes existing behavior gets a one-line pointer added to the technical doc it affects.
